import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Carousel from './components/Carousel';
import Categories from './components/categories/Categories';
import Explore from './components/explore/Explore';
import Footer from './components/footer/Footer';
import MainContainer from './components/main-container/MainContainer';
import Navbar from './components/navbar/Navbar';
import QuizList from './components/quiz/QuizList';
import QuizResult from './components/quiz/QuizResult';
import QuizTaker from './components/quiz/QuizTaker';

function App() {
  const [mode, setMode] = useState('light');
  const [modeIcon, setModeIcon] = useState('bi bi-brightness-high-fill');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for existing authentication on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleMode = () => {
    if(mode === 'light'){
      setMode('dark');
      setModeIcon('bi bi-moon-stars-fill');
      document.body.style.backgroundColor = 'grey';
      document.documentElement.setAttribute('data-theme', 'dark');
    }else{
      setMode('light');
      setModeIcon('bi bi-brightness-high-fill');
      document.body.style.backgroundColor = 'white';
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleSignup = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="app d-flex flex-column min-vh-100">
        <Navbar 
          title='Indian Culture' 
          mode={mode} 
          modeIcon={modeIcon} 
          toggleMode={toggleMode}
          user={user}
          onLogout={handleLogout}
        />
        
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={
              <>
                <Carousel />
                <MainContainer />
                <Categories />
              </>
            } />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/quiz/:quizId" element={<QuizTaker />} />
            <Route path="/quiz-result" element={<QuizResult />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
