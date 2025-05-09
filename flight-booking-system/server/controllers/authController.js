const authService = require('../services/authService');

// Register user
exports.register = async (req, res) => {
  try {
    const { user, token } = await authService.register(req.body);
    
    res.status(201).json({
      success: true,
      token,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    const { user, token } = await authService.login(email, password);
    
    // Set cookie with token
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
    
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
    }
    
    res.cookie('token', token, cookieOptions);
    
    res.status(200).json({
      success: true,
      token,
      data: user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// Get current user
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
};
