import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function QuizTaker() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, timeLeft]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:3001/quizzes/${quizId}`);
      if (!response.ok) {
        throw new Error('Quiz not found');
      }
      const data = await response.json();
      setQuiz(data.quiz);
      setTimeLeft(data.quiz.time_limit);
    } catch (error) {
      setError('Failed to load quiz');
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionId) => {
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        selected_option_id: optionId,
        time_taken: timeTaken
      }
    }));
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        selected_option_id: answer.selected_option_id,
        time_taken: answer.time_taken
      }));

      const response = await fetch(`http://localhost:3001/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: answersArray,
          time_taken: quiz.time_limit - timeLeft
        })
      });

      if (response.ok) {
        const result = await response.json();
        navigate('/quiz-result', { 
          state: { 
            result,
            quizTitle: quiz.title,
            totalQuestions: quiz.questions.length
          }
        });
      } else {
        throw new Error('Failed to submit quiz');
      }
    } catch (error) {
      setError('Failed to submit quiz');
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading quiz...</span>
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
        <button className="btn btn-primary" onClick={() => navigate('/quizzes')}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning" role="alert">
          Quiz not found
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestion.id];

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">{quiz.title}</h4>
                <div className="d-flex align-items-center">
                  <i className="bi bi-clock me-2"></i>
                  <span className="fw-bold" style={{ 
                    color: timeLeft < 60 ? '#ff6b6b' : 'white' 
                  }}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="progress mb-2" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar" 
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </small>
                </div>
                <div className="col-md-6 text-end">
                  <span className="badge bg-info me-2">
                    {getAnsweredCount()} answered
                  </span>
                  <span className="badge bg-secondary">
                    {quiz.questions.length - getAnsweredCount()} remaining
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h5 className="card-title mb-4" style={{ 
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                {currentQuestion.question_text}
              </h5>

              <div className="options-container">
                {currentQuestion.options.map((option) => (
                  <div 
                    key={option.id}
                    className={`option-item p-3 mb-3 border rounded ${
                      isAnswered && isAnswered.selected_option_id === option.id
                        ? 'border-primary bg-light'
                        : 'border-light'
                    }`}
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: isAnswered && isAnswered.selected_option_id === option.id 
                        ? '#e3f2fd' 
                        : 'white'
                    }}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                  >
                    <div className="d-flex align-items-center">
                      <div className={`option-radio me-3 ${
                        isAnswered && isAnswered.selected_option_id === option.id
                          ? 'selected'
                          : ''
                      }`}>
                        <i className={`bi ${
                          isAnswered && isAnswered.selected_option_id === option.id
                            ? 'bi-check-circle-fill text-primary'
                            : 'bi-circle'
                        }`} style={{ fontSize: '1.2rem' }}></i>
                      </div>
                      <span style={{ 
                        fontSize: '1.1rem',
                        color: '#2c3e50'
                      }}>
                        {option.option_text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="row mt-4">
        <div className="col-lg-8 mx-auto">
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Previous
            </button>

            <div className="d-flex gap-2">
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  disabled={!isAnswered}
                >
                  Next
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={handleSubmitQuiz}
                  disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Submit Quiz
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="row mt-4">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Question Navigation</h6>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {quiz.questions.map((question, index) => (
                  <button
                    key={question.id}
                    className={`btn btn-sm ${
                      index === currentQuestionIndex
                        ? 'btn-primary'
                        : answers[question.id]
                        ? 'btn-success'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                    style={{ minWidth: '40px' }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizTaker; 