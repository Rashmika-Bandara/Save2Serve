import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function SignUp() {
  const [form, setForm] = useState({
    fullName: '',
    goodName: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    role: 'Buyer'
  });
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
      await axios.post('http://localhost:4000/api/auth/signup', form);
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-image-section">
        <div className="auth-image-overlay"></div>
        <img src="/images/R.jpg" alt="Save2Serve Community" className="auth-bg-image" />
        <div className="auth-image-content">
          <h1 className="auth-brand-title">Join Save2Serve</h1>
          <p className="auth-brand-subtitle">Be part of the solution to food waste</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="feature-icon">✨</span>
              <span>Easy Registration</span>
            </div>
            <div className="auth-feature">
              <span className="feature-icon">🎯</span>
              <span>Choose Your Role</span>
            </div>
            <div className="auth-feature">
              <span className="feature-icon">💚</span>
              <span>Make a Difference</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-wrapper signup-form">
          <div className="auth-logo-container">
            <img src="/images/logo.png" alt="Save2Serve Logo" className="auth-logo" />
          </div>
          
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join our community today</p>
          </div>

          <form className="modern-auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="fullName"
                    className="modern-input"
                    name="fullName"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="goodName" className="form-label">Preferred Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">✏️</span>
                  <input
                    id="goodName"
                    className="modern-input"
                    name="goodName"
                    placeholder="Nickname"
                    value={form.goodName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="email"
                  className="modern-input"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    className="modern-input"
                    name="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    id="phone"
                    className="modern-input"
                    name="phone"
                    placeholder="+1 234 567 8900"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dob" className="form-label">Date of Birth</label>
                <div className="input-wrapper">
                  <span className="input-icon">🎂</span>
                  <input
                    id="dob"
                    className="modern-input"
                    name="dob"
                    type="date"
                    value={form.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">I want to</label>
                <div className="input-wrapper">
                  <span className="input-icon">🎭</span>
                  <select
                    id="role"
                    className="modern-input"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="Buyer">Receive Food</option>
                    <option value="Seller">Donate Food</option>
                  </select>
                </div>
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
                'Create Account'
              )}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="modern-auth-button secondary"
              onClick={handleLoginClick}
            >
              Already have an account? Sign In
            </button>

            <p className="auth-footer-text">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
