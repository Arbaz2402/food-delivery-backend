const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ReviewSchema.index({ restaurant: 1, customer: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
