import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleProfileClick = () => {
    // Navigate to profile page or toggle dropdown
    // For now, just navigate to home
    navigate('/home');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-container" onClick={() => navigate('/home')}>
          <h1 className="brand-logo">feed</h1>
        </div>
        
        <div className="user-container">
          <button onClick={handleProfileClick} className="user-icon-button">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {user.name && <span className="user-name">{user.name.split(' ')[0]}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;