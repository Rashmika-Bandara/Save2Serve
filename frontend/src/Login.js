import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', form);
      setMessage('Login successful!');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Redirect based on role
      setTimeout(() => {
        if (res.data.user.role === 'Seller') {
          navigate('/seller-dashboard');
        } else {
          navigate('/buyer-dashboard');
        }
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="auth-container">
      <div className="auth-image-section">
        <div className="auth-image-overlay"></div>
        <img src="/images/food giving.jpg" alt="Save2Serve" className="auth-bg-image" />
        <div className="auth-image-content">
          <h1 className="auth-brand-title">Save2Serve</h1>
          <p className="auth-brand-subtitle">Connecting communities through food sharing</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="feature-icon">🍽️</span>
              <span>Share surplus food</span>
            </div>
            <div className="auth-feature">
              <span className="feature-icon">🤝</span>
              <span>Help those in need</span>
            </div>
            <div className="auth-feature">
              <span className="feature-icon">🌍</span>
              <span>Reduce food waste</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="auth-logo-container">
            <img src="/images/logo.png" alt="Save2Serve Logo" className="auth-logo" />
          </div>
          
          <div className="auth-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue to Save2Serve</p>
          </div>

          <form className="modern-auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="email"
                  className="modern-input"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  className="modern-input"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {message && (
              <div className={`auth-message ${message.includes('successful') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button className="modern-auth-button" type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="modern-auth-button secondary"
              onClick={handleSignupClick}
            >
              Create New Account
            </button>

            <p className="auth-footer-text">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
