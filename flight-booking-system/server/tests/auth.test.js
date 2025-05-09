const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

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
  await User.deleteMany({});
});

// Close database connection after tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication API', () => {
  // Test user registration
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('email', 'test@example.com');
  });

  // Test user login
  it('should login an existing user', async () => {
    // First create a user
    await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'login@example.com',
      password: 'password123'
    });
    
    // Now attempt to login
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
  });
});
