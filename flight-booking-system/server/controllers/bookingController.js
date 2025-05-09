const bookingService = require('../services/bookingService');

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const { booking } = await bookingService.createBooking(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { booking, payment } = await bookingService.processPayment(
      req.params.bookingId,
      req.body
    );
    
    res.status(200).json({
      success: true,
      data: { booking, payment }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const result = await bookingService.cancelBooking(
      req.params.bookingId,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.id);
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
