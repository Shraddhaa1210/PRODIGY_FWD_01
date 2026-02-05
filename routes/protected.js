const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/profile
// @desc    Get user profile (protected route)
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: '🔐 Protected profile data',
      user,
      tokenInfo: {
        issuedAt: new Date(req.user.iat * 1000).toISOString(),
        expiresAt: new Date(req.user.exp * 1000).toISOString(),
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/admin
// @desc    Admin-only route
// @access  Private/Admin
router.get('/admin', authenticate, authorize('admin'), (req, res) => {
  res.json({
    message: '👑 Welcome to Admin Dashboard',
    user: req.user,
    features: [
      'User Management',
      'System Settings',
      'View All Data',
      'Admin Controls'
    ]
  });
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/dashboard
// @desc    General dashboard for all authenticated users
// @access  Private
router.get('/dashboard', authenticate, (req, res) => {
  res.json({
    message: '📊 Welcome to your Dashboard',
    greeting: `Hello, ${req.user.username}!`,
    role: req.user.role,
    features: req.user.role === 'admin' 
      ? ['View Reports', 'Manage Users', 'System Settings']
      : ['View Profile', 'Update Settings', 'View History'],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;