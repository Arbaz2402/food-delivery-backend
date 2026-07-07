const ErrorResponse = require('../utils/errorResponse');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

let io;

exports.setSocketIO = (socketIO) => {
  io = socketIO;
};

exports.getOrders = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'customer') {
      query = Order.find({ customer: req.user.id });
    } else if (req.user.role === 'restaurant') {
      const restaurants = await Restaurant.find({ owner: req.user.id });
      const restaurantIds = restaurants.map((r) => r._id);
      query = Order.find({ restaurant: { $in: restaurantIds } });
    } else if (req.user.role === 'delivery') {
      query = Order.find({ deliveryPerson: req.user.id });
    } else {
      query = Order.find();
    }

    const orders = await query
      .populate('customer', 'name phone')
      .populate('restaurant', 'name address')
      .populate('deliveryPerson', 'name phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone')
      .populate('restaurant', 'name address')
      .populate('deliveryPerson', 'name phone');

    if (!order) {
      return next(
        new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
      );
    }

    if (
      req.user.role === 'customer' &&
      order.customer._id.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to access this order`,
          401
        )
      );
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { restaurant, items, deliveryAddress, deliveryLocation, paymentMethod, specialInstructions } = req.body;

    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return next(
        new ErrorResponse(`Restaurant not found with id of ${restaurant}`, 404)
      );
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return next(
          new ErrorResponse(`Menu item not found with id of ${item.menuItem}`, 404)
        );
      }
      if (!menuItem.isAvailable) {
        return next(
          new ErrorResponse(`${menuItem.name} is not available`, 400)
        );
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
      });
    }

    const deliveryFee = restaurantDoc.deliveryFee || 0;
    const tax = totalAmount * 0.05;
    const grandTotal = totalAmount + deliveryFee + tax;

    const estimatedDeliveryTime = new Date(Date.now() + 45 * 60000);

    const order = await Order.create({
      customer: req.user.id,
      restaurant,
      items: orderItems,
      totalAmount,
      deliveryFee,
      tax,
      grandTotal,
      deliveryAddress,
      deliveryLocation,
      paymentMethod,
      specialInstructions,
      estimatedDeliveryTime,
    });

    await order.populate('customer', 'name phone');
    await order.populate('restaurant', 'name address');

    if (io) {
      io.emit('orderPlaced', order);
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return next(
        new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
      );
    }

    if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findById(order.restaurant);
      if (restaurant.owner.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized', 401));
      }
    } else if (req.user.role === 'delivery') {
      if (order.deliveryPerson && order.deliveryPerson.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized', 401));
      }
    } else if (req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 401));
    }

    order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate('customer', 'name phone')
      .populate('restaurant', 'name address')
      .populate('deliveryPerson', 'name phone');

    if (io) {
      io.emit('orderStatusUpdated', order);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

exports.assignDeliveryPerson = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(
        new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
      );
    }

    const deliveryPerson = await User.findOne({
      _id: req.body.deliveryPerson,
      role: 'delivery',
      isAvailable: true,
    });

    if (!deliveryPerson) {
      return next(
        new ErrorResponse('Delivery person not found or unavailable', 404)
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryPerson: deliveryPerson._id, status: 'out-for-delivery' },
      { new: true, runValidators: true }
    ).populate('customer', 'name phone')
      .populate('restaurant', 'name address')
      .populate('deliveryPerson', 'name phone');

    if (io) {
      io.emit('orderStatusUpdated', updatedOrder);
      io.emit('orderAssigned', updatedOrder);
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
};

exports.getNearbyDeliveryPersons = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return next(new ErrorResponse('Please provide latitude and longitude', 400));
    }

    const deliveryPersons = await User.find({
      role: 'delivery',
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 10000,
        },
      },
    });

    res.status(200).json({
      success: true,
      count: deliveryPersons.length,
      data: deliveryPersons,
    });
  } catch (err) {
    next(err);
  }
};
