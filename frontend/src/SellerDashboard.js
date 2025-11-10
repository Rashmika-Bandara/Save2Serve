import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('add');
  const [myListings, setMyListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const [newListing, setNewListing] = useState({
    name: '',
    quantity: '',
    expiryTime: '',
    description: '',
    image: '',
    status: 'free',
    price: 0,
    location: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    if (userData.role !== 'Seller') {
      navigate('/buyer-dashboard');
      return;
    }
    
    setUser(userData);
    loadMyListings();
    loadRequests();
    loadFeedback();
  }, [navigate]);

  const loadMyListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:4000/api/food/my-listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyListings(res.data);
    } catch (err) {
      console.error('Error loading listings:', err);
    }
  };

  const loadRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:4000/api/food/seller/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  };

  const loadFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:4000/api/food/seller/feedback', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(res.data);
    } catch (err) {
      console.error('Error loading feedback:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:4000/api/food/listings', {
        ...newListing,
        sellerName: user.goodName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Listing added successfully!');
      setNewListing({
        name: '',
        quantity: '',
        expiryTime: '',
        description: '',
        image: '',
        status: 'free',
        price: 0,
        location: ''
      });
      loadMyListings();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error adding listing');
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/food/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Listing deleted successfully!');
      loadMyListings();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error deleting listing');
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:4000/api/food/requests/${requestId}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Request updated successfully!');
      loadRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error updating request');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src="/images/logo.png" alt="Save2Serve" className="sidebar-logo" />
          <h2>Save2Serve</h2>
        </div>
        
        <div className="user-profile">
          <div className="user-avatar">{user.goodName?.charAt(0).toUpperCase()}</div>
          <h3>{user.goodName}</h3>
          <p className="user-role">Seller Account</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <span className="nav-icon">➕</span>
            Add Food Listing
          </button>
          <button 
            className={`nav-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <span className="nav-icon">📋</span>
            My Listings
          </button>
          <button 
            className={`nav-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span className="nav-icon">📬</span>
            Buyer Requests
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="badge">{requests.filter(r => r.status === 'pending').length}</span>
            )}
          </button>
          <button 
            className={`nav-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <span className="nav-icon">📊</span>
            Track Activity
          </button>
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        {message && (
          <div className={`dashboard-message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="dashboard-content">
            <h1 className="page-title">Add New Food Listing</h1>
            <div className="content-card">
              <form onSubmit={handleSubmitListing} className="listing-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Food Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newListing.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Fresh Vegetables"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="text"
                      name="quantity"
                      value={newListing.quantity}
                      onChange={handleInputChange}
                      placeholder="e.g., 5 kg"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="expiryTime"
                      value={newListing.expiryTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={newListing.location}
                      onChange={handleInputChange}
                      placeholder="Pickup location"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={newListing.description}
                    onChange={handleInputChange}
                    placeholder="Describe the food item..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      name="status"
                      value={newListing.status}
                      onChange={handleInputChange}
                    >
                      <option value="free">Free</option>
                      <option value="low-cost">Low Cost</option>
                    </select>
                  </div>
                  {newListing.status === 'low-cost' && (
                    <div className="form-group">
                      <label>Price ($) *</label>
                      <input
                        type="number"
                        name="price"
                        value={newListing.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Image URL (optional)</label>
                  <input
                    type="url"
                    name="image"
                    value={newListing.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <button type="submit" className="btn-primary">
                  <span>➕</span> Add Listing
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="dashboard-content">
            <h1 className="page-title">My Food Listings</h1>
            <div className="listings-grid">
              {myListings.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <p>No listings yet. Add your first food listing!</p>
                </div>
              ) : (
                myListings.map(listing => (
                  <div key={listing._id} className="listing-card">
                    {listing.image && (
                      <div className="listing-image">
                        <img src={listing.image} alt={listing.name} />
                      </div>
                    )}
                    <div className="listing-content">
                      <h3>{listing.name}</h3>
                      <div className="listing-details">
                        <p><strong>Quantity:</strong> {listing.quantity}</p>
                        <p><strong>Location:</strong> {listing.location}</p>
                        <p><strong>Expires:</strong> {new Date(listing.expiryTime).toLocaleString()}</p>
                        <p><strong>Status:</strong> 
                          <span className={`status-badge ${listing.status}`}>
                            {listing.status === 'free' ? '🎁 Free' : `💵 $${listing.price}`}
                          </span>
                        </p>
                        <p className="listing-description">{listing.description}</p>
                      </div>
                      <div className="listing-actions">
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteListing(listing._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="dashboard-content">
            <h1 className="page-title">Buyer Requests</h1>
            <div className="requests-list">
              {requests.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No requests yet</p>
                </div>
              ) : (
                requests.map(request => (
                  <div key={request._id} className="request-card">
                    <div className="request-header">
                      <div>
                        <h3>{request.foodId?.name}</h3>
                        <p className="request-buyer">From: {request.buyerName}</p>
                      </div>
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    {request.message && (
                      <p className="request-message">💬 {request.message}</p>
                    )}
                    <p className="request-date">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                    {request.status === 'pending' && (
                      <div className="request-actions">
                        <button 
                          className="btn-accept"
                          onClick={() => handleUpdateRequestStatus(request._id, 'accepted')}
                        >
                          ✓ Accept
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleUpdateRequestStatus(request._id, 'cancelled')}
                        >
                          ✗ Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="dashboard-content">
            <h1 className="page-title">Activity & Feedback</h1>
            
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">📦</span>
                <h3>{myListings.length}</h3>
                <p>Total Listings</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✅</span>
                <h3>{requests.filter(r => r.status === 'completed').length}</h3>
                <p>Completed</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⏳</span>
                <h3>{requests.filter(r => r.status === 'pending').length}</h3>
                <p>Pending</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⭐</span>
                <h3>{feedback.length > 0 ? (feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length).toFixed(1) : '0'}</h3>
                <p>Avg Rating</p>
              </div>
            </div>

            <h2 className="section-title">Recent Feedback</h2>
            <div className="feedback-list">
              {feedback.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">⭐</span>
                  <p>No feedback yet</p>
                </div>
              ) : (
                feedback.map(fb => (
                  <div key={fb._id} className="feedback-card">
                    <div className="feedback-header">
                      <div>
                        <h4>{fb.buyerName}</h4>
                        <p className="feedback-food">{fb.foodId?.name}</p>
                      </div>
                      <div className="rating">
                        {'⭐'.repeat(fb.rating)}
                      </div>
                    </div>
                    {fb.comment && <p className="feedback-comment">{fb.comment}</p>}
                    <p className="feedback-date">{new Date(fb.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SellerDashboard;
