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

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurant management endpoints
 */

router.use('/:restaurantId/menu-items', menuItemRouter);
router.use('/:restaurantId/reviews', reviewRouter);

/**
 * @swagger
 * /api/v1/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: List of restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60d0fe4f5311236168a109cb
 *                       name:
 *                         type: string
 *                         example: Pizza Palace
 *                       address:
 *                         type: string
 *                         example: 123 Main St
 *                       phone:
 *                         type: string
 *                         example: +1234567890
 *                       cuisine:
 *                         type: string
 *                         example: Italian
 *                       rating:
 *                         type: number
 *                         example: 4.5
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - phone
 *               - cuisine
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizza Palace
 *               address:
 *                 type: string
 *                 example: 123 Main St
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               cuisine:
 *                 type: string
 *                 example: Italian
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (not restaurant owner or admin)
 */
router.route('/').get(getRestaurants).post(protect, authorize('restaurant', 'admin'), createRestaurant);

/**
 * @swagger
 * /api/v1/restaurants/{id}:
 *   get:
 *     summary: Get a single restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant details
 *       404:
 *         description: Restaurant not found
 *   put:
 *     summary: Update a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Pizza Palace
 *               address:
 *                 type: string
 *                 example: 456 New St
 *     responses:
 *       200:
 *         description: Restaurant updated
 *       401:
 *         description: Not authorized
 *   delete:
 *     summary: Delete a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant deleted
 *       401:
 *         description: Not authorized
 */
router
  .route('/:id')
  .get(getRestaurant)
  .put(protect, authorize('restaurant', 'admin'), updateRestaurant)
  .delete(protect, authorize('restaurant', 'admin'), deleteRestaurant);

module.exports = router;
