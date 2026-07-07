const express = require('express');
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurants');
const { protect, authorize } = require('../middleware/auth');

const menuItemRouter = require('./menuItems');
const reviewRouter = require('./reviews');

const router = express.Router();

router.use('/:restaurantId/menu-items', menuItemRouter);
router.use('/:restaurantId/reviews', reviewRouter);

router.route('/').get(getRestaurants).post(protect, authorize('restaurant', 'admin'), createRestaurant);
router
  .route('/:id')
  .get(getRestaurant)
  .put(protect, authorize('restaurant', 'admin'), updateRestaurant)
  .delete(protect, authorize('restaurant', 'admin'), deleteRestaurant);

module.exports = router;
