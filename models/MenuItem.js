const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an item name'],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  image: {
    type: String,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
