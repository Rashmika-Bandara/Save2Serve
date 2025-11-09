import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', form);
      setMessage('Login successful!');
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input className="auth-input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input className="auth-input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <button className="auth-button" type="submit">Login</button>
      <div className="auth-message">{message}</div>
      <div style={{ marginTop: '18px', textAlign: 'center', color: '#555' }}>
        If you do not have an account
      </div>
      <button
        type="button"
        className="auth-button"
        style={{ marginTop: '8px', background: '#43a047' }}
        onClick={handleSignupClick}
      >
        Sign Up
      </button>
    </form>
  );
}

export default Login;
