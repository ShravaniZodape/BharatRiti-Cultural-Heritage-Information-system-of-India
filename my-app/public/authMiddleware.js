const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'project_sgd',
  password: 'Vjti@123',
  port: 5432
});

// JWT secret key (in production, use environment variable)
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is logged in (optional authentication)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (result.rows.length > 0) {
      req.user = result.rows[0];
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  JWT_SECRET
}; 