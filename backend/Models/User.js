const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  goodName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  role: { type: String, enum: ['Seller', 'Buyer'], required: true }
});

module.exports = mongoose.model('User', userSchema);
