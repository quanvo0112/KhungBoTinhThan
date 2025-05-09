const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register user
exports.register = async (userData) => {
  try {
    const user = await User.create(userData);
    
    // Remove password from response
    user.password = undefined;
    
    const token = generateToken(user._id);
    
    return { user, token };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Login user
exports.login = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    // Remove password from response
    user.password = undefined;
    
    const token = generateToken(user._id);
    
    return { user, token };
  } catch (error) {
    throw new Error(error.message);
  }
};
