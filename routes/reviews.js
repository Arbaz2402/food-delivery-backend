const express = require('express');
const { getReviews, createReview } = require('../controllers/reviews');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/').get(getReviews).post(protect, authorize('customer'), createReview);

module.exports = router;
