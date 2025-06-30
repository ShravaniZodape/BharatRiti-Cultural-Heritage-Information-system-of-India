const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, JWT_SECRET } = require('./authMiddleware');
const app = express();
const PORT = 3001; // Changed port to 3001

// Enable CORS for all origins during development
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(express.json());

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'postgres',       // Replace with your PostgreSQL username
  host: 'localhost',      // Replace with your PostgreSQL host
  database: 'project_sgd',    // Replace with your database name
  password: 'Vjti@123',   // Replace with your password
  port: 5432              // Default PostgreSQL port
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Successfully connected to PostgreSQL database!');
  release();
});

// Authentication endpoints

// Signup endpoint
app.post('/auth/signup', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, first_name, last_name',
      [username, email, passwordHash, first_name || null, last_name || null]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username or email
    const result = await pool.query(
      'SELECT id, username, email, password_hash, first_name, last_name FROM users WHERE (username = $1 OR email = $1) AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Get current user profile (protected route)
app.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password endpoint (protected route)
app.post('/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current password hash
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch heritage sites
app.get('/heritage-sites', async (req, res) => {
  try {
    console.log('Fetching heritage sites...');
    const result = await pool.query(`
      SELECT name, ST_AsGeoJSON(location) AS geojson
      FROM heritage_sites;
    `);
    
    console.log(`Found ${result.rows.length} heritage sites`);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No heritage sites found' });
    }

    const geojsonData = result.rows.map(row => ({
      type: 'Feature',
      properties: { 
        name: row.name,
        sites_in_15_proximity: row.sites_in_15_proximity || 'N/A'
      },
      geometry: JSON.parse(row.geojson)
    }));

    res.json({
      type: 'FeatureCollection',
      features: geojsonData
    });
  } catch (err) {
    console.error('Error fetching heritage sites:', err.stack);
    res.status(500).json({ 
      error: 'Error fetching heritage sites from database',
      details: err.message
    });
  }
});

// Endpoint to fetch state data (GeoJSON format)
app.get('/states', async (req, res) => {
  try {
    console.log('Fetching states data...');
    const result = await pool.query(`
      SELECT 
        gid, 
        name, 
        languages, 
        dance_form, 
        cuisine, 
        festivals, 
        traditiona, 
        historical, 
        ST_AsGeoJSON(geom) AS geojson
      FROM output_polygon
      ORDER BY name;
    `);
    
    console.log(`Found ${result.rows.length} states`);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No states found' });
    }

    const geojsonData = result.rows.map(row => {
      try {
        return {
          type: 'Feature',
          properties: {
            gid: row.gid,
            name: row.name,
            languages: row.languages || 'N/A',
            dance_form: row.dance_form || 'N/A',
            cuisine: row.cuisine || 'N/A',
            festivals: row.festivals || 'N/A',
            traditiona: row.traditiona || 'N/A',
            historical: row.historical || 'N/A'
          },
          geometry: JSON.parse(row.geojson)
        };
      } catch (parseError) {
        console.error(`Error parsing GeoJSON for state ${row.name}:`, parseError);
        return null;
      }
    }).filter(Boolean); // Remove any null entries

    if (geojsonData.length === 0) {
      return res.status(500).json({ 
        error: 'No valid GeoJSON data found',
        message: 'All states had invalid GeoJSON data'
      });
    }

    res.json({
      type: 'FeatureCollection',
      features: geojsonData
    });
  } catch (err) {
    console.error('Error fetching data from database:', err.stack);
    res.status(500).json({ 
      error: "Error fetching data from database",
      details: err.message 
    });
  }
});

// Test endpoint to check database connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'success', 
      message: 'Database connection successful',
      timestamp: result.rows[0].now
    });
  } catch (err) {
    console.error('Database connection test failed:', err.stack);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// Quiz System Endpoints

// Get all available quizzes
app.get('/quizzes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, category, difficulty_level, total_questions, time_limit, passing_score
      FROM quizzes 
      WHERE is_active = true 
      ORDER BY category, difficulty_level
    `);
    
    res.json({
      quizzes: result.rows
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz by ID with questions and options
app.get('/quizzes/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Get quiz details
    const quizResult = await pool.query(
      'SELECT * FROM quizzes WHERE id = $1 AND is_active = true',
      [quizId]
    );
    
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const quiz = quizResult.rows[0];
    
    // Get questions with options
    const questionsResult = await pool.query(`
      SELECT 
        q.id, q.question_text, q.question_type, q.points,
        json_agg(
          json_build_object(
            'id', ao.id,
            'option_text', ao.option_text,
            'is_correct', ao.is_correct
          )
        ) as options
      FROM questions q
      LEFT JOIN answer_options ao ON q.id = ao.question_id
      WHERE q.quiz_id = $1
      GROUP BY q.id, q.question_text, q.question_type, q.points
      ORDER BY q.id
    `, [quizId]);
    
    res.json({
      quiz: {
        ...quiz,
        questions: questionsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit quiz answers (protected route)
app.post('/quizzes/:quizId/submit', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, time_taken } = req.body;
    const userId = req.user.id;
    
    // Check if quiz exists
    const quizResult = await pool.query(
      'SELECT * FROM quizzes WHERE id = $1 AND is_active = true',
      [quizId]
    );
    
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const quiz = quizResult.rows[0];
    
    // Get correct answers for scoring
    const correctAnswersResult = await pool.query(`
      SELECT q.id as question_id, ao.id as correct_option_id
      FROM questions q
      JOIN answer_options ao ON q.id = ao.question_id
      WHERE q.quiz_id = $1 AND ao.is_correct = true
    `, [quizId]);
    
    const correctAnswers = {};
    correctAnswersResult.rows.forEach(row => {
      correctAnswers[row.question_id] = row.correct_option_id;
    });
    
    // Calculate score
    let correctCount = 0;
    for (const answer of answers) {
      if (correctAnswers[answer.question_id] === answer.selected_option_id) {
        correctCount++;
      }
    }
    
    const totalQuestions = correctAnswersResult.rows.length;
    const score = correctCount;
    const percentageScore = (correctCount / totalQuestions) * 100;
    const passed = percentageScore >= quiz.passing_score;
    
    // Create attempt record
    const attemptRecord = {
      quiz_id: parseInt(quizId),
      quiz_title: quiz.title,
      score: score,
      total_questions: totalQuestions,
      correct_answers: correctCount,
      percentage_score: percentageScore,
      passed: passed,
      time_taken: time_taken,
      answers: answers,
      completed_at: new Date().toISOString()
    };
    
    // Get current user data
    const userResult = await pool.query(
      'SELECT quiz_attempts, total_quiz_score, total_quiz_attempts, best_quiz_score, average_quiz_score, total_quiz_time, quizzes_completed, quizzes_passed FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const currentAttempts = user.quiz_attempts || [];
    const currentAchievements = user.quiz_achievements || [];
    
    // Add new attempt
    currentAttempts.push(attemptRecord);
    
    // Update user statistics
    const newTotalScore = user.total_quiz_score + score;
    const newTotalAttempts = user.total_quiz_attempts + 1;
    const newBestScore = Math.max(user.best_quiz_score, percentageScore);
    const newAverageScore = newTotalAttempts > 0 ? (newTotalScore / newTotalAttempts) : 0;
    const newTotalTime = user.total_quiz_time + time_taken;
    const newQuizzesCompleted = user.quizzes_completed + 1;
    const newQuizzesPassed = user.quizzes_passed + (passed ? 1 : 0);
    
    // Check for achievements
    const newAchievements = [];
    
    // First quiz achievement
    if (newQuizzesCompleted === 1) {
      const firstQuizAchievement = {
        type: 'first_quiz',
        name: 'First Quiz Completed',
        description: 'Completed your first cultural quiz!',
        earned_at: new Date().toISOString()
      };
      newAchievements.push(firstQuizAchievement);
      currentAchievements.push(firstQuizAchievement);
    }
    
    // Perfect score achievement
    if (percentageScore === 100) {
      const perfectScoreAchievement = {
        type: 'perfect_score',
        name: 'Perfect Score',
        description: 'Achieved 100% on a quiz!',
        earned_at: new Date().toISOString()
      };
      newAchievements.push(perfectScoreAchievement);
      currentAchievements.push(perfectScoreAchievement);
    }
    
    // Speed demon achievement (completed in less than 50% of time limit)
    if (time_taken < quiz.time_limit * 0.5) {
      const speedDemonAchievement = {
        type: 'speed_demon',
        name: 'Speed Demon',
        description: 'Completed a quiz in less than half the time limit!',
        earned_at: new Date().toISOString()
      };
      newAchievements.push(speedDemonAchievement);
      currentAchievements.push(speedDemonAchievement);
    }
    
    // Update user record
    await pool.query(`
      UPDATE users 
      SET quiz_attempts = $1, quiz_achievements = $2, total_quiz_score = $3, 
          total_quiz_attempts = $4, best_quiz_score = $5, average_quiz_score = $6,
          total_quiz_time = $7, quizzes_completed = $8, quizzes_passed = $9
      WHERE id = $10
    `, [
      JSON.stringify(currentAttempts),
      JSON.stringify(currentAchievements),
      newTotalScore,
      newTotalAttempts,
      newBestScore,
      newAverageScore,
      newTotalTime,
      newQuizzesCompleted,
      newQuizzesPassed,
      userId
    ]);
    
    res.json({
      score,
      total_questions: totalQuestions,
      correct_answers: correctCount,
      percentage_score: percentageScore,
      passed,
      time_taken,
      new_achievements: newAchievements
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user quiz history (protected route)
app.get('/user/quiz-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT quiz_attempts FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const attempts = result.rows[0].quiz_attempts || [];
    
    res.json({
      quiz_history: attempts.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics (protected route)
app.get('/user/statistics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        total_quiz_attempts, quizzes_passed, average_quiz_score, best_quiz_score,
        total_quiz_time, quizzes_completed, quiz_achievements
      FROM users WHERE id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Calculate category statistics from attempts
    const attemptsResult = await pool.query(
      'SELECT quiz_attempts FROM users WHERE id = $1',
      [userId]
    );
    
    const attempts = attemptsResult.rows[0].quiz_attempts || [];
    const categoryStats = {};
    
    attempts.forEach(attempt => {
      if (!categoryStats[attempt.quiz_id]) {
        categoryStats[attempt.quiz_id] = {
          attempts: 0,
          total_score: 0,
          best_score: 0
        };
      }
      categoryStats[attempt.quiz_id].attempts++;
      categoryStats[attempt.quiz_id].total_score += attempt.percentage_score;
      categoryStats[attempt.quiz_id].best_score = Math.max(
        categoryStats[attempt.quiz_id].best_score, 
        attempt.percentage_score
      );
    });
    
    // Get quiz titles for categories
    const quizIds = Object.keys(categoryStats);
    let categoryStatsWithNames = [];
    
    if (quizIds.length > 0) {
      const quizResult = await pool.query(`
        SELECT id, title, category FROM quizzes WHERE id = ANY($1)
      `, [quizIds]);
      
      categoryStatsWithNames = quizResult.rows.map(quiz => ({
        quiz_id: quiz.id,
        category: quiz.category,
        title: quiz.title,
        attempts: categoryStats[quiz.id].attempts,
        average_score: categoryStats[quiz.id].total_score / categoryStats[quiz.id].attempts,
        best_score: categoryStats[quiz.id].best_score
      }));
    }
    
    res.json({
      statistics: {
        total_attempts: user.total_quiz_attempts || 0,
        passed_attempts: user.quizzes_passed || 0,
        average_score: user.average_quiz_score || 0,
        best_score: user.best_quiz_score || 0,
        total_time: user.total_quiz_time || 0,
        quizzes_attempted: user.quizzes_completed || 0
      },
      achievements: user.quiz_achievements || [],
      category_stats: categoryStatsWithNames
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;



