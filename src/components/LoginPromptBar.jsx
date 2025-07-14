import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login-prompt-bar.scss';

export default function LoginPromptBar() {
  const navigate = useNavigate();
  return (
    <div className="login-prompt-bar">
      <button className="btn" onClick={() => navigate('/login')}>Get Inside</button>
    </div>
  );
}
