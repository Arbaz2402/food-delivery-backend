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

/**
 * @swagger
 * tags:
 *   name: Menu Items
 *   description: Menu item management endpoints
 */

/**
 * @swagger
 * /api/v1/restaurants/{restaurantId}/menu-items:
 *   get:
 *     summary: Get all menu items for a restaurant
 *     tags: [Menu Items]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of menu items
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Margherita Pizza
 *               price:
 *                 type: number
 *                 example: 12.99
 *               description:
 *                 type: string
 *                 example: Classic pizza with tomato and cheese
 *               isAvailable:
                 type: boolean
                 example: true
 *     responses:
 *       201:
 *         description: Menu item created
 *       401:
 *         description: Not authorized
 */
router.route('/').get(getMenuItems).post(protect, authorize('restaurant', 'admin'), createMenuItem);

/**
 * @swagger
 * /api/v1/restaurants/{restaurantId}/menu-items/{id}:
 *   get:
 *     summary: Get a single menu item
 *     tags: [Menu Items]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item details
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a menu item
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Menu item updated
 *       401:
 *         description: Not authorized
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item deleted
 *       401:
 *         description: Not authorized
 */
router
  .route('/:id')
  .get(getMenuItem)
  .put(protect, authorize('restaurant', 'admin'), updateMenuItem)
  .delete(protect, authorize('restaurant', 'admin'), deleteMenuItem);

module.exports = router;
