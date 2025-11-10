import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('browse');
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [feedback, setFeedback] = useState({ rating: 5, comment: '', foodId: null, sellerId: null });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    if (userData.role !== 'Buyer') {
      navigate('/seller-dashboard');
      return;
    }
    
    setUser(userData);
    loadListings();
    loadMyRequests();
  }, [navigate]);

  useEffect(() => {
    filterListings();
  }, [listings, searchTerm, filterStatus]);

  const loadListings = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/food/listings');
      setListings(res.data);
    } catch (err) {
      console.error('Error loading listings:', err);
    }
  };

  const loadMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:4000/api/food/buyer/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRequests(res.data);
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];
    
    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(listing => listing.status === filterStatus);
    }
    
    setFilteredListings(filtered);
  };

  const handleRequestFood = (listing) => {
    setSelectedListing(listing);
    setShowRequestModal(true);
  };

  const submitRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:4000/api/food/requests', {
        foodId: selectedListing._id,
        sellerId: selectedListing.sellerId,
        buyerName: user.goodName,
        message: requestMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Request sent successfully!');
      setShowRequestModal(false);
      setRequestMessage('');
      loadMyRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending request');
    }
  };

  const handleProvideFeedback = (request) => {
    setFeedback({
      rating: 5,
      comment: '',
      foodId: request.foodId._id,
      sellerId: request.sellerId
    });
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:4000/api/food/feedback', {
        ...feedback,
        buyerName: user.goodName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setFeedback({ rating: 5, comment: '', foodId: null, sellerId: null });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error submitting feedback');
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
          <p className="user-role">Buyer Account</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <span className="nav-icon">🔍</span>
            Browse Food
          </button>
          <button 
            className={`nav-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span className="nav-icon">📝</span>
            My Requests
            {myRequests.filter(r => r.status === 'accepted').length > 0 && (
              <span className="badge">{myRequests.filter(r => r.status === 'accepted').length}</span>
            )}
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

        {activeTab === 'browse' && (
          <div className="dashboard-content">
            <h1 className="page-title">Browse Available Food</h1>
            
            <div className="filter-section">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'free' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('free')}
                >
                  🎁 Free
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'low-cost' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('low-cost')}
                >
                  💵 Low Cost
                </button>
              </div>
            </div>

            <div className="listings-grid">
              {filteredListings.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🍽️</span>
                  <p>No food listings available at the moment</p>
                </div>
              ) : (
                filteredListings.map(listing => (
                  <div key={listing._id} className="listing-card buyer-card">
                    {listing.image && (
                      <div className="listing-image">
                        <img src={listing.image} alt={listing.name} />
                      </div>
                    )}
                    <div className="listing-content">
                      <h3>{listing.name}</h3>
                      <p className="listing-seller">👤 {listing.sellerName}</p>
                      <div className="listing-details">
                        <p><strong>Quantity:</strong> {listing.quantity}</p>
                        <p><strong>Location:</strong> 📍 {listing.location}</p>
                        <p><strong>Expires:</strong> ⏰ {new Date(listing.expiryTime).toLocaleString()}</p>
                        <p><strong>Status:</strong> 
                          <span className={`status-badge ${listing.status}`}>
                            {listing.status === 'free' ? '🎁 Free' : `💵 $${listing.price}`}
                          </span>
                        </p>
                        <p className="listing-description">{listing.description}</p>
                      </div>
                      <button 
                        className="btn-primary"
                        onClick={() => handleRequestFood(listing)}
                      >
                        Request Food
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="dashboard-content">
            <h1 className="page-title">My Requests</h1>
            <div className="requests-list">
              {myRequests.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No requests yet. Browse food and make your first request!</p>
                </div>
              ) : (
                myRequests.map(request => (
                  <div key={request._id} className="request-card buyer-request">
                    <div className="request-header">
                      <div>
                        <h3>{request.foodId?.name}</h3>
                        <p className="request-info">
                          📍 {request.foodId?.location} • {request.foodId?.quantity}
                        </p>
                      </div>
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    {request.message && (
                      <p className="request-message">💬 Your message: {request.message}</p>
                    )}
                    <p className="request-date">
                      Requested on: {new Date(request.createdAt).toLocaleString()}
                    </p>
                    {request.status === 'accepted' && (
                      <div className="request-actions">
                        <button 
                          className="btn-feedback"
                          onClick={() => handleProvideFeedback(request)}
                        >
                          ⭐ Provide Feedback
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Request Food</h2>
            <div className="modal-food-info">
              <h3>{selectedListing?.name}</h3>
              <p>📍 {selectedListing?.location}</p>
              <p>Quantity: {selectedListing?.quantity}</p>
            </div>
            <div className="form-group">
              <label>Message to Seller (optional)</label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Any special requests or pickup preferences..."
                rows="4"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowRequestModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={submitRequest}>
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Provide Feedback</h2>
            <div className="form-group">
              <label>Rating</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`star ${feedback.rating >= star ? 'active' : ''}`}
                    onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Comment (optional)</label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience..."
                rows="4"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={submitFeedback}>
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;
