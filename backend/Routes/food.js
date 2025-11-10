const express = require('express');
const router = express.Router();
const FoodListing = require('../Models/FoodListing');
const Request = require('../Models/Request');
const Feedback = require('../Models/Feedback');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all food listings (for buyers)
router.get('/listings', async (req, res) => {
  try {
    const listings = await FoodListing.find({ available: true })
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get seller's own listings
router.get('/my-listings', verifyToken, async (req, res) => {
  try {
    const listings = await FoodListing.find({ sellerId: req.userId })
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new food listing (seller only)
router.post('/listings', verifyToken, async (req, res) => {
  try {
    const { name, quantity, expiryTime, description, image, status, price, location } = req.body;
    
    const newListing = new FoodListing({
      name,
      quantity,
      expiryTime,
      description,
      image,
      status,
      price: status === 'low-cost' ? price : 0,
      location,
      sellerId: req.userId,
      sellerName: req.body.sellerName
    });
    
    await newListing.save();
    res.status(201).json({ message: 'Listing created successfully', listing: newListing });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update food listing
router.put('/listings/:id', verifyToken, async (req, res) => {
  try {
    const listing = await FoodListing.findOne({ _id: req.params.id, sellerId: req.userId });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    
    Object.assign(listing, req.body);
    await listing.save();
    res.json({ message: 'Listing updated successfully', listing });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete food listing
router.delete('/listings/:id', verifyToken, async (req, res) => {
  try {
    const listing = await FoodListing.findOneAndDelete({ _id: req.params.id, sellerId: req.userId });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create request (buyer)
router.post('/requests', verifyToken, async (req, res) => {
  try {
    const { foodId, sellerId, message, buyerName } = req.body;
    
    const newRequest = new Request({
      foodId,
      buyerId: req.userId,
      buyerName,
      sellerId,
      message
    });
    
    await newRequest.save();
    res.status(201).json({ message: 'Request sent successfully', request: newRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get requests for seller
router.get('/seller/requests', verifyToken, async (req, res) => {
  try {
    const requests = await Request.find({ sellerId: req.userId })
      .populate('foodId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get requests for buyer
router.get('/buyer/requests', verifyToken, async (req, res) => {
  try {
    const requests = await Request.find({ buyerId: req.userId })
      .populate('foodId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update request status (seller)
router.put('/requests/:id', verifyToken, async (req, res) => {
  try {
    const request = await Request.findOne({ _id: req.params.id, sellerId: req.userId });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    request.status = req.body.status;
    await request.save();
    res.json({ message: 'Request updated successfully', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create feedback (buyer)
router.post('/feedback', verifyToken, async (req, res) => {
  try {
    const { foodId, sellerId, rating, comment, buyerName } = req.body;
    
    const newFeedback = new Feedback({
      foodId,
      buyerId: req.userId,
      buyerName,
      sellerId,
      rating,
      comment
    });
    
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get feedback for seller
router.get('/seller/feedback', verifyToken, async (req, res) => {
  try {
    const feedback = await Feedback.find({ sellerId: req.userId })
      .populate('foodId')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
