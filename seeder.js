require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const Review = require('./models/Review');
const Order = require('./models/Order');

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.log(err));

// Dummy Data
const dummyUsers = [
  {
    name: 'John Customer',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
    phone: '+1234567890',
    address: '123 Main St, City',
    location: {
      type: 'Point',
      coordinates: [-74.006, 40.7128] // NYC coordinates
    }
  },
  {
    name: 'Jane Restaurant',
    email: 'jane@example.com',
    password: 'password123',
    role: 'restaurant',
    phone: '+0987654321',
    address: '456 Oak Ave, City'
  },
  {
    name: 'Bob Delivery',
    email: 'bob@example.com',
    password: 'password123',
    role: 'delivery',
    phone: '+1122334455',
    isAvailable: true,
    location: {
      type: 'Point',
      coordinates: [-73.980, 40.750]
    }
  },
  {
    name: 'Alice Admin',
    email: 'alice@example.com',
    password: 'password123',
    role: 'admin',
    phone: '+9988776655'
  }
];

const dummyRestaurants = [];
const dummyMenuItems = [];

// Seed Function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data...');

    // Hash passwords and create users
    const users = await Promise.all(dummyUsers.map(async (userData) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      return User.create({ ...userData, password: hashedPassword });
    }));
    console.log('Users seeded!');

    const restaurantOwner = users.find(u => u.role === 'restaurant');
    const customer = users.find(u => u.role === 'customer');
    const deliveryPerson = users.find(u => u.role === 'delivery');

    // Create Restaurants
    const restaurants = await Restaurant.create([
      {
        name: 'Pizza Palace',
        description: 'Best Italian pizza in town!',
        cuisine: ['Italian', 'Pizza'],
        address: '789 Pine Rd, City',
        location: {
          type: 'Point',
          coordinates: [-74.008, 40.715]
        },
        phone: '+2233445566',
        rating: 4.5,
        totalReviews: 0,
        deliveryFee: 2.99,
        minimumOrder: 10,
        openingHours: '10 AM - 11 PM',
        owner: restaurantOwner._id,
        isActive: true
      },
      {
        name: 'Burger Barn',
        description: 'Juicy burgers and crispy fries!',
        cuisine: ['American', 'Fast Food'],
        address: '321 Elm St, City',
        location: {
          type: 'Point',
          coordinates: [-73.990, 40.705]
        },
        phone: '+3344556677',
        rating: 4.2,
        totalReviews: 0,
        deliveryFee: 1.99,
        minimumOrder: 8,
        openingHours: '11 AM - 10 PM',
        owner: restaurantOwner._id,
        isActive: true
      }
    ]);
    console.log('Restaurants seeded!');

    // Create Menu Items
    const menuItems = await MenuItem.create([
      // Pizza Palace items
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Pizza',
        isAvailable: true,
        restaurant: restaurants[0]._id
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Margherita topped with spicy pepperoni',
        price: 14.99,
        category: 'Pizza',
        isAvailable: true,
        restaurant: restaurants[0]._id
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine with parmesan and croutons',
        price: 7.99,
        category: 'Salad',
        isAvailable: true,
        restaurant: restaurants[0]._id
      },
      // Burger Barn items
      {
        name: 'Classic Cheeseburger',
        description: 'Beef patty, cheddar, lettuce, tomato, onion, and special sauce',
        price: 9.99,
        category: 'Burger',
        isAvailable: true,
        restaurant: restaurants[1]._id
      },
      {
        name: 'Bacon Burger',
        description: 'Cheeseburger with crispy bacon',
        price: 11.99,
        category: 'Burger',
        isAvailable: true,
        restaurant: restaurants[1]._id
      },
      {
        name: 'French Fries',
        description: 'Golden crispy fries',
        price: 3.99,
        category: 'Sides',
        isAvailable: true,
        restaurant: restaurants[1]._id
      }
    ]);
    console.log('Menu items seeded!');

    // Create an Order
    const orderItems = [
      {
        menuItem: menuItems[0]._id,
        name: menuItems[0].name,
        quantity: 1,
        price: menuItems[0].price
      },
      {
        menuItem: menuItems[2]._id,
        name: menuItems[2].name,
        quantity: 1,
        price: menuItems[2].price
      }
    ];
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = restaurants[0].deliveryFee;
    const tax = (totalAmount * 0.08); // 8% tax
    const grandTotal = totalAmount + deliveryFee + tax;

    const order = await Order.create({
      customer: customer._id,
      restaurant: restaurants[0]._id,
      deliveryPerson: deliveryPerson._id,
      items: orderItems,
      totalAmount,
      deliveryFee,
      tax,
      grandTotal,
      deliveryAddress: customer.address,
      deliveryLocation: customer.location,
      status: 'confirmed',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      specialInstructions: 'No onions please!',
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
    });
    console.log('Order seeded!');

    // Create a Review
    await Review.create({
      restaurant: restaurants[0]._id,
      customer: customer._id,
      order: order._id,
      rating: 5,
      comment: 'Amazing pizza, fast delivery!'
    });
    console.log('Review seeded!');

    // Update restaurant rating
    await Restaurant.findByIdAndUpdate(restaurants[0]._id, {
      rating: 5,
      totalReviews: 1
    });
    console.log('Restaurant rating updated!');

    console.log('✅ All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Check if we need to clear data or seed
const args = process.argv.slice(2);
if (args[0] === '-d') {
  // Delete Data
  const deleteData = async () => {
    try {
      await User.deleteMany({});
      await Restaurant.deleteMany({});
      await MenuItem.deleteMany({});
      await Review.deleteMany({});
      await Order.deleteMany({});
      console.log('🗑️ All data deleted!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error deleting data:', error);
      process.exit(1);
    }
  };
  deleteData();
} else {
  seedData();
}