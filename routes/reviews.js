const express = require('express');
const { getReviews, createReview } = require('../controllers/reviews');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management endpoints
 */

/**
 * @swagger
 * /api/v1/restaurants/{restaurantId}/reviews:
 *   get:
 *     summary: Get all reviews for a restaurant
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of reviews
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
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
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Great food and service!
 *     responses:
 *       201:
 *         description: Review created
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (not a customer)
 */
router.route('/').get(getReviews).post(protect, authorize('customer'), createReview);

module.exports = router;
