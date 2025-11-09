import React, { useState } from 'react';
import axios from 'axios';

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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/auth/signup', form);
      setMessage('Registration successful! You can now log in.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input className="auth-input" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
      <input className="auth-input" name="goodName" placeholder="Good Name" value={form.goodName} onChange={handleChange} required />
      <input className="auth-input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input className="auth-input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <input className="auth-input" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
      <input className="auth-input" name="dob" type="date" placeholder="Date of Birth" value={form.dob} onChange={handleChange} required />
      <select className="auth-input" name="role" value={form.role} onChange={handleChange}>
        <option value="Buyer">Buyer</option>
        <option value="Seller">Seller</option>
      </select>
      <button className="auth-button" type="submit">Sign Up</button>
      <div className="auth-message">{message}</div>
    </form>
  );
}

export default SignUp;
