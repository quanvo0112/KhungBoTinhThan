const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const { v4: uuidv4 } = require('uuid');

// Create a new booking
exports.createBooking = async (bookingData, userId) => {
  try {
    const { flightId, passengerDetails, paymentDetails, seats } = bookingData;
    
    // Verify flight exists and has enough seats
    const flight = await Flight.findById(flightId);
    if (!flight) {
      throw new Error('Flight not found');
    }
    
    if (!flight.hasAvailableSeats(seats.length)) {
      throw new Error('Not enough seats available');
    }
    
    // Generate booking reference
    const bookingReference = `BK${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Create tickets for each seat
    const tickets = [];
    for (const seat of seats) {
      const ticketNumber = `TK${uuidv4().substring(0, 8).toUpperCase()}`;
      
      const ticket = await Ticket.create({
        ticketNumber,
        customer: userId,
        flight: flightId,
        seatNumber: seat.seatNumber,
        class: seat.class || 'economy',
        status: 'reserved'
      });
      
      tickets.push(ticket._id);
    }
    
    // Create booking
    const booking = await Booking.create({
      bookingReference,
      customer: userId,
      tickets,
      totalAmount: flight.price * seats.length,
      status: 'pending',
      contactInfo: {
        email: passengerDetails.email,
        phone: passengerDetails.phone
      },
      specialRequests: passengerDetails.specialRequests
    });
    
    // Reserve seats on the flight
    await flight.bookSeats(seats.length);
    
    return { booking, flight };
  } catch (error) {
    throw new Error(`Error creating booking: ${error.message}`);
  }
};

// Process payment for booking
exports.processPayment = async (bookingId, paymentDetails) => {
  try {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Create payment record
    const payment = await Payment.create({
      amount: booking.totalAmount,
      currency: paymentDetails.currency || 'USD',
      paymentMethod: paymentDetails.paymentMethod,
      status: 'completed',
      customer: booking.customer
    });
    
    // Update booking with payment and status
    booking.payment = payment._id;
    booking.status = 'confirmed';
    await booking.save();
    
    // Update tickets to confirmed
    await Ticket.updateMany(
      { _id: { $in: booking.tickets } },
      { status: 'confirmed' }
    );
    
    return { booking, payment };
  } catch (error) {
    throw new Error(`Error processing payment: ${error.message}`);
  }
};

// Cancel booking
exports.cancelBooking = async (bookingId, userId) => {
  try {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    if (booking.customer.toString() !== userId && req.user.role !== 'staff') {
      throw new Error('Not authorized to cancel this booking');
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    // Update tickets to cancelled
    await Ticket.updateMany(
      { _id: { $in: booking.tickets } },
      { status: 'cancelled' }
    );
    
    // Get flight to return seats
    const tickets = await Ticket.find({ _id: { $in: booking.tickets } });
    if (tickets.length > 0) {
      const flightId = tickets[0].flight;
      const flight = await Flight.findById(flightId);
      
      if (flight) {
        flight.availableSeats += tickets.length;
        await flight.save();
      }
    }
    
    // If payment exists, initiate refund process
    if (booking.payment) {
      await Payment.findByIdAndUpdate(booking.payment, { status: 'refunded' });
    }
    
    return { success: true, booking };
  } catch (error) {
    throw new Error(`Error cancelling booking: ${error.message}`);
  }
};

// Get bookings for user
exports.getUserBookings = async (userId) => {
  try {
    return await Booking.find({ customer: userId })
      .populate('tickets')
      .populate({
        path: 'tickets',
        populate: {
          path: 'flight',
          model: 'Flight'
        }
      })
      .populate('payment');
  } catch (error) {
    throw new Error(`Error fetching bookings: ${error.message}`);
  }
};
