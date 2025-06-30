# Authentication System Setup Guide

This guide will help you set up a complete login/signup authentication system with secure password storage using PostgreSQL.

## 🗄️ Database Setup

### 1. Create Database Tables
Run the following SQL commands in your PostgreSQL database:

```sql
-- Connect to your database first
\c project_sgd

-- Run the schema from database_schema.sql
-- This creates the users and user_sessions tables
```

### 2. Database Schema Details
- **users table**: Stores user credentials with hashed passwords
- **user_sessions table**: Optional session management
- **Indexes**: For faster username/email lookups
- **Triggers**: Auto-update timestamps

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
# In the root directory (backend)
npm install bcrypt jsonwebtoken
```

### 2. Database Configuration
Update the database connection in `server.js` and `authMiddleware.js`:
```javascript
const pool = new Pool({
  user: 'postgres',           // Your PostgreSQL username
  host: 'localhost',          // Your PostgreSQL host
  database: 'project_sgd',    // Your database name
  password: 'Vjti@123',       // Your password
  port: 5432                  // PostgreSQL port
});
```

### 3. JWT Secret Key
⚠️ **IMPORTANT**: Change the JWT secret in `authMiddleware.js`:
```javascript
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
```

## 🚀 Frontend Setup

### 1. Install Dependencies
```bash
# In the my-app directory (frontend)
cd my-app
npm install
```

### 2. Start the Application

#### Terminal 1 - Backend Server
```bash
# In the root directory
node my-app/public/server.js
```
Server will run on: http://localhost:3001

#### Terminal 2 - React Frontend
```bash
# In the my-app directory
cd my-app
npm start
```
Frontend will run on: http://localhost:3000

## 🔐 Security Features

### Password Security
- **bcrypt hashing**: Passwords are hashed with salt rounds of 12
- **Password validation**: Minimum 6 characters required
- **Secure comparison**: Uses bcrypt.compare() for password verification

### JWT Authentication
- **Token expiration**: 24 hours
- **Secure storage**: Tokens stored in localStorage
- **Protected routes**: Middleware for route protection

### Database Security
- **SQL injection prevention**: Parameterized queries
- **Input validation**: Server-side validation
- **Unique constraints**: Username and email uniqueness

## 📋 API Endpoints

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (protected)
- `POST /auth/change-password` - Change password (protected)

### Request/Response Examples

#### Signup Request
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login Request
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

#### Success Response
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🎨 Frontend Features

### Components Created
- **Login.js**: Login form with validation
- **Signup.js**: Registration form with validation
- **Updated Navbar.js**: Authentication UI integration
- **Updated App.js**: Route management and state

### User Experience
- **Form validation**: Real-time validation feedback
- **Loading states**: Visual feedback during API calls
- **Error handling**: User-friendly error messages
- **Responsive design**: Bootstrap-based UI
- **Dark/Light mode**: Integrated with existing theme

## 🔧 Customization

### Password Requirements
Modify in `server.js`:
```javascript
if (password.length < 6) {
  return res.status(400).json({ error: 'Password must be at least 6 characters long' });
}
```

### Token Expiration
Modify in `server.js`:
```javascript
const token = jwt.sign(
  { userId: user.id, username: user.username },
  JWT_SECRET,
  { expiresIn: '24h' } // Change this value
);
```

### Additional User Fields
Add fields to the users table and update the signup endpoint accordingly.

## 🚨 Security Best Practices

1. **Environment Variables**: Use .env files for sensitive data
2. **HTTPS**: Use HTTPS in production
3. **Rate Limiting**: Implement rate limiting for auth endpoints
4. **Password Policy**: Enforce strong password requirements
5. **Session Management**: Implement proper session handling
6. **Logging**: Add security event logging
7. **Input Sanitization**: Sanitize all user inputs

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify connection credentials
   - Ensure database exists

2. **CORS Errors**
   - Backend CORS is configured for development
   - Update CORS settings for production

3. **JWT Token Issues**
   - Check JWT_SECRET is set correctly
   - Verify token expiration
   - Check token format in requests

4. **Password Hashing Issues**
   - Ensure bcrypt is installed
   - Check salt rounds configuration

## 📝 Testing

### Manual Testing
1. Create a new account via signup
2. Login with credentials
3. Test protected routes
4. Test logout functionality
5. Test password change

### API Testing
Use tools like Postman or curl to test endpoints:
```bash
# Test signup
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'
```

## 🎯 Next Steps

1. **Email Verification**: Add email verification for new accounts
2. **Password Reset**: Implement forgot password functionality
3. **Social Login**: Add OAuth providers (Google, Facebook)
4. **Two-Factor Authentication**: Add 2FA support
5. **User Roles**: Implement role-based access control
6. **Profile Management**: Add user profile editing
7. **Activity Logging**: Track user activities

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure database is properly configured
4. Check network connectivity between frontend and backend 