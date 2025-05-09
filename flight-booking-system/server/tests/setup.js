const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');
const User = require('../models/User');
const Flight = require('../models/Flight');

dotenv.config({ path: './.env.test' });

let mongoServer;

// Connect to the in-memory database before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Seed the database with test data
beforeEach(async () => {
  // Create test users
  await User.create({
    firstName: 'Test',
    lastName: 'Customer',
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer'
  });
  
  await User.create({
    firstName: 'Test',
    lastName: 'Staff',
    email: 'staff@test.com',
    password: 'password123',
    role: 'staff'
  });
  
  // Create test flights
  await Flight.create({
    flightNumber: 'TG123',
    airline: 'Test Airlines',
    origin: 'New York',
    destination: 'London',
    departureTime: new Date(Date.now() + 86400000), // Tomorrow
    arrivalTime: new Date(Date.now() + 86400000 + 28800000), // Tomorrow + 8 hours
    capacity: 100,
    availableSeats: 80,
    price: 499.99
  });
});

// Clear all data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect and close the server after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Global test utilities
global.loginUser = async (request, email, password) => {
  const res = await request
    .post('/api/v1/auth/login')
    .send({ email, password });
  return res.body.token;
};
