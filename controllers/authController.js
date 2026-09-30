const User = require('../models/User');
const passwordService = require('../services/passwordService');
const jwtService = require('../services/jwtService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Please provide name, email, and password');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 409, 'User already exists with this email address');
    }

    const hashedPassword = await passwordService.hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, 201, 'User registered successfully', { user: userResponse });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const isMatch = await passwordService.comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const token = jwtService.generateToken({ id: user._id, email: user.email });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    };

    return sendSuccess(res, 200, 'User profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
