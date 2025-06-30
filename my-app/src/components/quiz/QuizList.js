import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
    fetchUserStats();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:3001/quizzes');
      const data = await response.json();
      setQuizzes(data.quizzes);
    } catch (error) {
      setError('Failed to load quizzes');
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/user/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'dance-forms': 'bi bi-music-note-beamed',
      'monuments': 'bi bi-building',
      'cuisines': 'bi bi-egg-fried',
      'languages': 'bi bi-translate'
    };
    return icons[category] || 'bi bi-question-circle';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'easy': 'success',
      'medium': 'warning',
      'hard': 'danger'
    };
    return colors[difficulty] || 'secondary';
  };

  const getCategoryName = (category) => {
    const names = {
      'dance-forms': 'Dance Forms',
      'monuments': 'Monuments & Heritage',
      'cuisines': 'Regional Cuisines',
      'languages': 'Languages & Literature'
    };
    return names[category] || category;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredQuizzes = selectedCategory === 'all' 
    ? quizzes 
    : quizzes.filter(quiz => quiz.category === selectedCategory);

  const categories = ['all', ...new Set(quizzes.map(quiz => quiz.category))];

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12">
          <h1 className="text-center mb-4" style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            Cultural Knowledge Quizzes
          </h1>
          <p className="text-center mb-4" style={{ 
            fontSize: '1.2rem', 
            color: '#7f8c8d'
          }}>
            Test your knowledge about India's rich cultural heritage
          </p>
        </div>
      </div>

      {/* User Statistics */}
      {userStats && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-trophy me-2"></i>
                  Your Quiz Statistics
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 col-6 mb-3">
                    <div className="text-center">
                      <h3 className="text-primary">{userStats.statistics.total_attempts || 0}</h3>
                      <p className="text-muted mb-0">Total Attempts</p>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="text-center">
                      <h3 className="text-success">{userStats.statistics.passed_attempts || 0}</h3>
                      <p className="text-muted mb-0">Passed Quizzes</p>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="text-center">
                      <h3 className="text-warning">
                        {userStats.statistics.average_score ? 
                          Math.round(userStats.statistics.average_score) : 0}%
                      </h3>
                      <p className="text-muted mb-0">Average Score</p>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="text-center">
                      <h3 className="text-info">{userStats.statistics.best_score || 0}%</h3>
                      <p className="text-muted mb-0">Best Score</p>
                    </div>
                  </div>
                </div>
                
                {/* Achievements */}
                {userStats.achievements && userStats.achievements.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-muted mb-3">Recent Achievements</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {userStats.achievements.slice(0, 3).map((achievement, index) => (
                        <span key={index} className="badge bg-warning text-dark">
                          <i className="bi bi-star-fill me-1"></i>
                          {achievement.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-center flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? (
                  <>
                    <i className="bi bi-grid me-2"></i>
                    All Categories
                  </>
                ) : (
                  <>
                    <i className={`${getCategoryIcon(category)} me-2`}></i>
                    {getCategoryName(category)}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Cards */}
      <div className="row">
        {filteredQuizzes.map(quiz => (
          <div key={quiz.id} className="col-lg-6 col-md-6 mb-4">
            <div className="card h-100 shadow-sm" style={{ 
              border: 'none',
              borderRadius: '15px',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
            >
              <div className="card-header bg-light border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <i className={`${getCategoryIcon(quiz.category)} me-2`} style={{ 
                      fontSize: '1.5rem', 
                      color: '#1976d2' 
                    }}></i>
                    <span className="text-muted">{getCategoryName(quiz.category)}</span>
                  </div>
                  <span className={`badge bg-${getDifficultyColor(quiz.difficulty_level)}`}>
                    {quiz.difficulty_level.charAt(0).toUpperCase() + quiz.difficulty_level.slice(1)}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <h5 className="card-title" style={{ 
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '1rem'
                }}>
                  {quiz.title}
                </h5>
                <p className="card-text" style={{ 
                  color: '#7f8c8d',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  marginBottom: '1.5rem'
                }}>
                  {quiz.description}
                </p>
                <div className="row text-center mb-3">
                  <div className="col-4">
                    <div className="text-muted small">Questions</div>
                    <div className="fw-bold">{quiz.total_questions}</div>
                  </div>
                  <div className="col-4">
                    <div className="text-muted small">Time Limit</div>
                    <div className="fw-bold">{formatTime(quiz.time_limit)}</div>
                  </div>
                  <div className="col-4">
                    <div className="text-muted small">Pass Score</div>
                    <div className="fw-bold">{quiz.passing_score}%</div>
                  </div>
                </div>
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                >
                  <i className="bi bi-play-circle me-2"></i>
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center my-5">
          <i className="bi bi-emoji-frown" style={{ fontSize: '3rem', color: '#7f8c8d' }}></i>
          <h4 className="mt-3 text-muted">No quizzes found</h4>
          <p className="text-muted">Try selecting a different category</p>
        </div>
      )}
    </div>
  );
}

export default QuizList; 