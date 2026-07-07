const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  assignDeliveryPerson,
  getNearbyDeliveryPersons,
} = require('../controllers/orders');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/nearby-delivery').get(getNearbyDeliveryPersons);
router.route('/').get(protect, getOrders).post(protect, authorize('customer'), createOrder);
router.route('/:id').get(protect, getOrder);
router.route('/:id/status').put(protect, authorize('restaurant', 'delivery', 'admin'), updateOrderStatus);
router.route('/:id/assign').put(protect, authorize('restaurant', 'admin'), assignDeliveryPerson);

module.exports = router;
