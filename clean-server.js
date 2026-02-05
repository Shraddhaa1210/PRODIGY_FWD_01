const express = require('express');
const app = express();

// ============ ADD CORS SUPPORT ============
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Use Node.js built-in crypto (no external package needed)
const crypto = require('crypto');

// ============ DATABASE ============
let users = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    password: 'demo123', // In real app, hash this!
    role: 'user',
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true,
    createdAt: new Date().toISOString()
  }
];

const tokens = {};

// ============ ROUTES ============
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🔐 Authentication System - Task Complete!',
    status: 'Running on PORT 5000',
    features: [
      'User Registration',
      'Secure Login',
      'Protected Routes',
      'JWT-like Tokens',
      'Email Verification Demo',
      'Social Login Demo'
    ],
    endpoints: {
      home: 'GET /',
      register: 'POST /api/register',
      login: 'POST /api/login',
      profile: 'GET /api/profile (protected)',
      dashboard: 'GET /api/dashboard (protected)',
      googleDemo: 'GET /api/auth/google',
      facebookDemo: 'GET /api/auth/facebook'
    },
    testUsers: [
      { email: 'demo@example.com', password: 'demo123', role: 'user' },
      { email: 'admin@example.com', password: 'admin123', role: 'admin' }
    ]
  });
});

// ============ REGISTER ============
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  // Generate verification token using built-in crypto
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  const user = {
    id: users.length + 1,
    username,
    email,
    password, // In real app: hash with bcrypt
    role: email === 'admin@example.com' ? 'admin' : 'user',
    isVerified: true, // Auto-verify for demo
    verificationToken,
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  
  // Create simple token
  const token = `auth-token-${user.id}-${Date.now()}`;
  tokens[token] = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  };
  
  console.log('='.repeat(60));
  console.log('📧 EMAIL VERIFICATION DEMO:');
  console.log(`User: ${username} <${email}>`);
  console.log(`Verification Token: ${verificationToken}`);
  console.log('='.repeat(60));
  
  res.json({
    success: true,
    message: '✅ Registration successful!',
    token,
    user: {
      id: user.id,
      username,
      email,
      role: user.role,
      isVerified: user.isVerified
    }
  });
});

// ============ LOGIN ============
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔑 Login attempt: ${email}`);
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({
      error: 'Login failed',
      hint: 'User not found. Register first or use demo@example.com'
    });
  }
  
  if (user.password !== password) {
    return res.status(401).json({
      error: 'Login failed',
      hint: 'Wrong password. Try: demo123 for demo@example.com'
    });
  }
  
  const token = `auth-token-${user.id}-${Date.now()}`;
  tokens[token] = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    isVerified: user.isVerified
  };
  
  res.json({
    success: true,
    message: '✅ Login successful!',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    }
  });
});

// ============ AUTH MIDDLEWARE ============
const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'Add: Authorization: Bearer YOUR_TOKEN'
    });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const userData = tokens[token];
  
  if (!userData) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = userData;
  next();
};

// ============ PROTECTED ROUTES ============
app.get('/api/profile', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  
  res.json({
    success: true,
    message: '🔒 Protected Profile Data',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }
  });
});

app.get('/api/dashboard', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  
  const features = user.role === 'admin'
    ? ['Manage Users', 'View Analytics', 'System Settings', 'Admin Panel']
    : ['View Profile', 'Edit Settings', 'View History', 'Change Password'];
  
  res.json({
    success: true,
    message: `📊 Welcome ${user.username}!`,
    role: user.role,
    isVerified: user.isVerified,
    features,
    quickActions: [
      { action: 'View Profile', endpoint: '/api/profile', method: 'GET' },
      { action: 'Update Profile', endpoint: '/api/update-profile', method: 'PUT' }
    ]
  });
});

// ============ SOCIAL LOGIN DEMOS ============
app.get('/api/auth/google', (req, res) => {
  // Generate random user ID using crypto
  const userId = crypto.randomBytes(4).toString('hex');
  
  const user = {
    id: parseInt(userId, 16),
    username: 'Google User',
    email: `google-${userId}@demo.com`,
    provider: 'google',
    isVerified: true,
    role: 'user',
    avatar: 'https://via.placeholder.com/150/DB4437/FFFFFF?text=G',
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  
  const token = `social-token-${user.id}-${Date.now()}`;
  tokens[token] = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    provider: 'google',
    isVerified: true
  };
  
  res.json({
    success: true,
    message: '✅ Google Login Successful!',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      provider: 'google',
      isVerified: true,
      avatar: user.avatar
    }
  });
});

app.get('/api/auth/facebook', (req, res) => {
  const userId = crypto.randomBytes(4).toString('hex');
  
  const user = {
    id: parseInt(userId, 16),
    username: 'Facebook User',
    email: `facebook-${userId}@demo.com`,
    provider: 'facebook',
    isVerified: true,
    role: 'user',
    avatar: 'https://via.placeholder.com/150/4267B2/FFFFFF?text=FB',
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  
  const token = `social-token-${user.id}-${Date.now()}`;
  tokens[token] = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    provider: 'facebook',
    isVerified: true
  };
  
  res.json({
    success: true,
    message: '✅ Facebook Login Successful!',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      provider: 'facebook',
      isVerified: true,
      avatar: user.avatar
    }
  });
});

// ============ START SERVER ============
const PORT = 5000;
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('🚀 CLEAN AUTHENTICATION SYSTEM - NO DEPRECATED PACKAGES');
  console.log('='.repeat(70));
  console.log(`✅ Server running: http://localhost:${PORT}`);
  console.log('');
  console.log('✨ FEATURES IMPLEMENTED:');
  console.log('   • User Registration & Login');
  console.log('   • Protected Routes with Tokens');
  console.log('   • Email Verification Demo');
  console.log('   • Social Login Demo (Google/Facebook)');
  console.log('   • Role-Based Access Control');
  console.log('');
  console.log('🔗 TEST ENDPOINTS:');
  console.log(`   • Home:        http://localhost:${PORT}`);
  console.log(`   • Google Demo: http://localhost:${PORT}/api/auth/google`);
  console.log(`   • Facebook:    http://localhost:${PORT}/api/auth/facebook`);
  console.log('');
  console.log('🔑 TEST CREDENTIALS:');
  console.log('   • Email: demo@example.com');
  console.log('   • Password: demo123');
  console.log('='.repeat(70));
});