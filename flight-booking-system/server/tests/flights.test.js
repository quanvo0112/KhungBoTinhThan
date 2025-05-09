const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Flight = require('../models/Flight');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Test database connection
beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://localhost:27017/flight_booking_test';
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up database between tests
beforeEach(async () => {
  await Flight.deleteMany({});
  await User.deleteMany({});
});

// Close database connection after tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Flights API', () => {
  // Test getting all flights
  it('should get all flights', async () => {
    // Add a test flight
    await Flight.create({
      flightNumber: 'TEST123',
      airline: 'Test Airlines',
      origin: 'New York',
      destination: 'London',
      departureTime: new Date(),
      arrivalTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
      capacity: 200,
      availableSeats: 150,
      price: 499.99
    });
    
    const res = await request(app).get('/api/v1/flights');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // Test creating a flight (staff only)
  it('should create a flight when authenticated as staff', async () => {
    // Create a staff user
    const staff = await User.create({
      firstName: 'Staff',
      lastName: 'User',
      email: 'staff@example.com',
      password: 'password123',
      role: 'staff'
    });
    
    // Generate token for staff
    const token = jwt.sign({ id: staff._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
    
    const res = await request(app)
      .post('/api/v1/flights')
      .set('Authorization', `Bearer ${token}`)
      .send({
        flightNumber: 'NEW100',
        airline: 'Test Airways',
        origin: 'Paris',
        destination: 'Tokyo',
        departureTime: new Date(),
        arrivalTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        capacity: 300,
        availableSeats: 300,
        price: 899.99
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('flightNumber', 'NEW100');
  });
});
