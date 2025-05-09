const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  },
  class: {
    type: String,
    enum: ['economy', 'business', 'first'],
    default: 'economy'
  },
  status: {
    type: String,
    enum: ['reserved', 'confirmed', 'cancelled'],
    default: 'reserved'
  }
}, {
  timestamps: true
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;