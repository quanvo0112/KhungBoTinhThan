const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  airline: {
    type: String,
    required: true,
    trim: true
  },
  origin: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
}, {
  timestamps: true
});

// Method to check if seats are available
flightSchema.methods.hasAvailableSeats = function(numSeats = 1) {
  return this.availableSeats >= numSeats;
};

// Method to book seats
flightSchema.methods.bookSeats = function(numSeats = 1) {
  if (!this.hasAvailableSeats(numSeats)) {
    throw new Error('Not enough seats available');
  }
  this.availableSeats -= numSeats;
  return this.save();
};

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;