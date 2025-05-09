const Flight = require('../models/Flight');

// Get all flights
exports.getAllFlights = async (filters = {}) => {
  try {
    return await Flight.find(filters);
  } catch (error) {
    throw new Error(`Error fetching flights: ${error.message}`);
  }
};

// Get flight by ID
exports.getFlightById = async (id) => {
  try {
    const flight = await Flight.findById(id);
    
    if (!flight) {
      throw new Error('Flight not found');
    }
    
    return flight;
  } catch (error) {
    throw new Error(`Error fetching flight: ${error.message}`);
  }
};

// Create new flight
exports.createFlight = async (flightData) => {
  try {
    return await Flight.create(flightData);
  } catch (error) {
    throw new Error(`Error creating flight: ${error.message}`);
  }
};

// Update flight
exports.updateFlight = async (id, flightData) => {
  try {
    const flight = await Flight.findByIdAndUpdate(id, flightData, {
      new: true,
      runValidators: true
    });
    
    if (!flight) {
      throw new Error('Flight not found');
    }
    
    return flight;
  } catch (error) {
    throw new Error(`Error updating flight: ${error.message}`);
  }
};

// Delete flight
exports.deleteFlight = async (id) => {
  try {
    const flight = await Flight.findByIdAndDelete(id);
    
    if (!flight) {
      throw new Error('Flight not found');
    }
    
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting flight: ${error.message}`);
  }
};

// Search flights
exports.searchFlights = async (criteria) => {
  try {
    const { origin, destination, departureDate } = criteria;
    
    const query = {};
    
    if (origin) query.origin = new RegExp(origin, 'i');
    if (destination) query.destination = new RegExp(destination, 'i');
    
    if (departureDate) {
      const date = new Date(departureDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      query.departureTime = {
        $gte: date,
        $lt: nextDay
      };
    }
    
    return await Flight.find(query);
  } catch (error) {
    throw new Error(`Error searching flights: ${error.message}`);
  }
};
