const express = require('express');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuItems');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/').get(getMenuItems).post(protect, authorize('restaurant', 'admin'), createMenuItem);
router
  .route('/:id')
  .get(getMenuItem)
  .put(protect, authorize('restaurant', 'admin'), updateMenuItem)
  .delete(protect, authorize('restaurant', 'admin'), deleteMenuItem);

module.exports = router;
