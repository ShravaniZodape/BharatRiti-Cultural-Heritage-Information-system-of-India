import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, quizTitle, totalQuestions } = location.state || {};

  if (!result) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning" role="alert">
          No quiz result found. Please take a quiz first.
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/quizzes')}>
          Go to Quizzes
        </button>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! Well done!';
    if (percentage >= 70) return 'Good work! Keep it up!';
    if (percentage >= 60) return 'Not bad! You passed!';
    return 'Keep practicing! You can do better!';
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="mb-3" style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              Quiz Results
            </h1>
            <h3 className="text-muted">{quizTitle}</h3>
          </div>

          {/* Score Card */}
          <div className="card shadow-lg mb-4">
            <div className="card-body text-center p-5">
              <div className="mb-4">
                <div className="display-1 fw-bold text-primary mb-2">
                  {result.percentage_score}%
                </div>
                <div className={`h4 text-${getScoreColor(result.percentage_score)} mb-3`}>
                  {getScoreMessage(result.percentage_score)}
                </div>
                <div className={`badge bg-${result.passed ? 'success' : 'danger'} fs-6`}>
                  {result.passed ? 'PASSED' : 'FAILED'}
                </div>
              </div>

              <div className="row text-center">
                <div className="col-md-3 col-6 mb-3">
                  <div className="h5 text-primary">{result.score}</div>
                  <div className="text-muted">Correct Answers</div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="h5 text-info">{totalQuestions}</div>
                  <div className="text-muted">Total Questions</div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="h5 text-warning">{formatTime(result.time_taken)}</div>
                  <div className="text-muted">Time Taken</div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="h5 text-success">{result.correct_answers}</div>
                  <div className="text-muted">Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          {result.new_achievements && result.new_achievements.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="bi bi-trophy me-2"></i>
                  New Achievements Unlocked!
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {result.new_achievements.map((achievement, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="d-flex align-items-center p-3 border rounded bg-light">
                        <div className="me-3">
                          <i className="bi bi-star-fill text-warning" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-bold">{achievement.name}</h6>
                          <p className="mb-0 text-muted small">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-center">
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/quizzes')}
              >
                <i className="bi bi-list me-2"></i>
                Take Another Quiz
              </button>
              <button 
                className="btn btn-outline-secondary btn-lg"
                onClick={() => navigate('/')}
              >
                <i className="bi bi-house me-2"></i>
                Go Home
              </button>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="card mt-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-lightbulb me-2"></i>
                Performance Tips
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Read questions carefully before answering
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Manage your time wisely during the quiz
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Review your answers before submitting
                </li>
                <li className="mb-0">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Practice regularly to improve your knowledge
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizResult; 