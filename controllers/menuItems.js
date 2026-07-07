const ErrorResponse = require('../utils/errorResponse');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

exports.getMenuItems = async (req, res, next) => {
  try {
    let query;

    if (req.params.restaurantId) {
      query = MenuItem.find({ restaurant: req.params.restaurantId });
    } else {
      query = MenuItem.find();
    }

    const menuItems = await query;

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
      return next(
        new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (err) {
    next(err);
  }
};

exports.createMenuItem = async (req, res, next) => {
  try {
    req.body.restaurant = req.params.restaurantId;

    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return next(
        new ErrorResponse(`Restaurant not found with id of ${req.params.restaurantId}`, 404)
      );
    }

    if (
      restaurant.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add menu items to this restaurant`,
          401
        )
      );
    }

    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      data: menuItem,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return next(
        new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404)
      );
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant);

    if (
      restaurant.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this menu item`,
          401
        )
      );
    }

    menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return next(
        new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404)
      );
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant);

    if (
      restaurant.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this menu item`,
          401
        )
      );
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
