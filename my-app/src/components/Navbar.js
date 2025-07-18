import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

function Navbar(props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/explore', { state: { searchQuery } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg navbar-${props.mode} bg-${props.mode}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1050,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <a className="navbar-brand" href="/">{props.title}</a>
          </div>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse nav nav-underline" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/"
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active underline' : ''}`
                  }
                >Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/explore"
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active underline' : ''}`
                  }
                >Explore</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/quizzes"
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active underline' : ''}`
                  }
                >Quizzes</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/Assistant"
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active underline' : ''}`
                  }
                >Assistant</NavLink>
              </li>
            </ul>
            <form className="d-flex" role="search" onSubmit={handleSearch}>
              <input 
                className="form-control me-2" 
                type="search" 
                placeholder="Search for a state..." 
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-success" type="submit">Search</button>
            </form>
            
            {/* Authentication Section */}
            <div className='d-flex mx-2 align-items-center'>
              {user ? (
                <div className="dropdown">
                  <button 
                    className="btn btn-outline-primary dropdown-toggle" 
                    type="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user.first_name || user.username}
                  </button>
                  <ul className="dropdown-menu">
                    <li><span className="dropdown-item-text">Welcome, {user.first_name || user.username}!</span></li>
                    <li><hr className="dropdown-divider"/></li>
                    <li><a className="dropdown-item" href="/profile">Profile</a></li>
                    <li><a className="dropdown-item" href="/quiz-history">Quiz History</a></li>
                    <li><a className="dropdown-item" href="/achievements">Achievements</a></li>
                    <li><hr className="dropdown-divider"/></li>
                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleLogin}
                  >
                    Login
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSignup}
                  >
                    Sign Up
                  </button>
                </div>
              )}
              
              <button 
                type="button" 
                className="btn btn-light ms-2" 
                onClick={props.toggleMode} 
                style={{border: '1px solid black'}}
              >
                <i className={`${props.modeIcon}`}></i>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div style={{ height: '56px' }}></div>
    </>
  );
}

export default Navbar;
