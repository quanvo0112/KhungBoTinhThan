const express = require('express');
const {
  createBooking,
  processPayment,
  cancelBooking,
  getUserBookings
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getUserBookings)
  .post(createBooking);

router.route('/:bookingId/payment')
  .post(processPayment);

router.route('/:bookingId/cancel')
  .patch(cancelBooking);

module.exports = router;
