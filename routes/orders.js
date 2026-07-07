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

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/v1/orders/nearby-delivery:
 *   get:
 *     summary: Get nearby delivery persons
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of nearby delivery persons
 */
router.route('/nearby-delivery').get(getNearbyDeliveryPersons);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant
 *               - items
 *               - deliveryAddress
 *             properties:
 *               restaurant:
 *                 type: string
 *                 description: Restaurant ID
 *                 example: 60d0fe4f5311236168a109cb
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - menuItem
 *                     - quantity
 *                   properties:
 *                     menuItem:
 *                       type: string
 *                       description: Menu item ID
 *                       example: 60d0fe4f5311236168a109cc
 *                     quantity:
 *                       type: number
 *                       example: 2
 *               deliveryAddress:
 *                 type: string
 *                 example: 789 Oak St
 *               specialInstructions:
 *                 type: string
 *                 example: No onions
 *     responses:
 *       201:
 *         description: Order created (emits socket event)
 *       401:
 *         description: Not authorized
 */
router.route('/').get(protect, getOrders).post(protect, authorize('customer'), createOrder);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get a single order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.route('/:id').get(protect, getOrder);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled]
 *                 example: preparing
 *     responses:
 *       200:
 *         description: Order status updated (emits socket event)
 *       401:
 *         description: Not authorized
 */
router.route('/:id/status').put(protect, authorize('restaurant', 'delivery', 'admin'), updateOrderStatus);

/**
 * @swagger
 * /api/v1/orders/{id}/assign:
 *   put:
 *     summary: Assign a delivery person to order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryPerson
 *             properties:
 *               deliveryPerson:
 *                 type: string
 *                 description: Delivery person user ID
 *                 example: 60d0fe4f5311236168a109cd
 *     responses:
 *       200:
 *         description: Delivery person assigned (emits socket event)
 *       401:
 *         description: Not authorized
 */
router.route('/:id/assign').put(protect, authorize('restaurant', 'admin'), assignDeliveryPerson);

module.exports = router;
