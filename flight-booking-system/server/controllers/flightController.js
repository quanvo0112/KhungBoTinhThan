const flightService = require('../services/flightService');

// Get all flights
exports.getFlights = async (req, res) => {
  try {
    const flights = await flightService.getAllFlights();
    
    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get single flight
exports.getFlight = async (req, res) => {
  try {
    const flight = await flightService.getFlightById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: flight
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Create new flight
exports.createFlight = async (req, res) => {
  try {
    const flight = await flightService.createFlight(req.body);
    
    res.status(201).json({
      success: true,
      data: flight
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update flight
exports.updateFlight = async (req, res) => {
  try {
    const flight = await flightService.updateFlight(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: flight
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete flight
exports.deleteFlight = async (req, res) => {
  try {
    await flightService.deleteFlight(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Search flights
exports.searchFlights = async (req, res) => {
  try {
    const flights = await flightService.searchFlights(req.query);
    
    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
