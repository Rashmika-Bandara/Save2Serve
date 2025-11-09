import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';
import './App.css';
function App() {
  return (
    <Router>
      <header className="main-header">
        <div className="header-title">Save2Serve</div>
        <nav className="header-nav">
          <Link to="/login" className="header-link">Login</Link>
        </nav>
      </header>
      <div className="page-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
