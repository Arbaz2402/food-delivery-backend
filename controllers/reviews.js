const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

exports.getReviews = async (req, res, next) => {
  try {
    let query;

    if (req.params.restaurantId) {
      query = Review.find({ restaurant: req.params.restaurantId });
    } else {
      query = Review.find();
    }

    const reviews = await query
      .populate('customer', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    req.body.restaurant = req.params.restaurantId;
    req.body.customer = req.user.id;

    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return next(
        new ErrorResponse(`Restaurant not found with id of ${req.params.restaurantId}`, 404)
      );
    }

    const order = await Order.findById(req.body.order);
    if (!order) {
      return next(
        new ErrorResponse(`Order not found with id of ${req.body.order}`, 404)
      );
    }

    if (order.customer.toString() !== req.user.id) {
      return next(
        new ErrorResponse('You can only review orders you placed', 401)
      );
    }

    const existingReview = await Review.findOne({
      restaurant: req.params.restaurantId,
      customer: req.user.id,
      order: req.body.order,
    });

    if (existingReview) {
      return next(
        new ErrorResponse('You have already reviewed this order', 400)
      );
    }

    const review = await Review.create(req.body);

    const reviews = await Review.find({ restaurant: req.params.restaurantId });
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    await Restaurant.findByIdAndUpdate(req.params.restaurantId, {
      rating: Math.round(averageRating * 10) / 10,
      totalReviews,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};
