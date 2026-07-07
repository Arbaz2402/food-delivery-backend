# Food Delivery Backend API Documentation

## Base URL

All endpoints are prefixed with: `http://localhost:5001/api/v1`

## Authentication

Most endpoints require authentication using a Bearer token. Include it in your request headers:

```
Authorization: Bearer <your_token_here>
```

## User Roles

- `customer`: Can browse restaurants, place orders, leave reviews
- `restaurant`: Can manage restaurants and menu items, update order status
- `delivery`: Can accept deliveries and update delivery status
- `admin`: Full access to all features

---

## Authentication Endpoints

### Register a User

**URL**: `/auth/register`
**Method**: `POST`
**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "phone": "1234567890",
  "address": "123 Main St",
  "location": {
    "type": "Point",
    "coordinates": [77.1025, 28.7041]
  }
}
```

### Login

**URL**: `/auth/login`
**Method**: `POST`
**Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User

**URL**: `/auth/me`
**Method**: `GET`
**Auth Required**: Yes

### Update Current User

**URL**: `/auth/me`
**Method**: `PUT`
**Auth Required**: Yes

---

## Restaurant Endpoints

### Get All Restaurants

**URL**: `/restaurants`
**Method**: `GET`
**Query Parameters**:
- `lat` & `lng`: Get restaurants near this location
- `maxDistance`: Maximum distance in meters (default 10000)
- `cuisine`: Filter by cuisine type
- `page` & `limit`: For pagination

### Get Single Restaurant

**URL**: `/restaurants/:id`
**Method**: `GET`

### Create Restaurant

**URL**: `/restaurants`
**Method**: `POST`
**Auth Required**: Yes (restaurant or admin)

### Update Restaurant

**URL**: `/restaurants/:id`
**Method**: `PUT`
**Auth Required**: Yes (restaurant owner or admin)

### Delete Restaurant

**URL**: `/restaurants/:id`
**Method**: `DELETE`
**Auth Required**: Yes (restaurant owner or admin)

---

## Menu Item Endpoints

### Get Menu Items

**URL**: `/restaurants/:restaurantId/menu-items`
**Method**: `GET`

### Get Single Menu Item

**URL**: `/restaurants/:restaurantId/menu-items/:id`
**Method**: `GET`

### Create Menu Item

**URL**: `/restaurants/:restaurantId/menu-items`
**Method**: `POST`
**Auth Required**: Yes (restaurant owner or admin)

### Update Menu Item

**URL**: `/restaurants/:restaurantId/menu-items/:id`
**Method**: `PUT`
**Auth Required**: Yes (restaurant owner or admin)

### Delete Menu Item

**URL**: `/restaurants/:restaurantId/menu-items/:id`
**Method**: `DELETE`
**Auth Required**: Yes (restaurant owner or admin)

---

## Order Endpoints

### Get Orders

**URL**: `/orders`
**Method**: `GET`
**Auth Required**: Yes
**Description**: Returns orders based on user role

### Get Single Order

**URL**: `/orders/:id`
**Method**: `GET`
**Auth Required**: Yes

### Create Order

**URL**: `/orders`
**Method**: `POST`
**Auth Required**: Yes (customer)
**Body**:
```json
{
  "restaurant": "restaurant_id",
  "items": [
    {
      "menuItem": "menu_item_id",
      "quantity": 2
    }
  ],
  "deliveryAddress": "123 Main St",
  "deliveryLocation": {
    "type": "Point",
    "coordinates": [77.1025, 28.7041]
  },
  "paymentMethod": "card",
  "specialInstructions": "No onions"
}
```

### Update Order Status

**URL**: `/orders/:id/status`
**Method**: `PUT`
**Auth Required**: Yes (restaurant, delivery, admin)
**Body**:
```json
{
  "status": "preparing"
}
```
**Status Options**: `pending`, `confirmed`, `preparing`, `ready-for-pickup`, `out-for-delivery`, `delivered`, `cancelled`

### Assign Delivery Person

**URL**: `/orders/:id/assign`
**Method**: `PUT`
**Auth Required**: Yes (restaurant, admin)
**Body**:
```json
{
  "deliveryPerson": "user_id"
}
```

### Get Nearby Delivery Persons

**URL**: `/orders/nearby-delivery`
**Method**: `GET`
**Query Parameters**:
- `lat`: Latitude
- `lng`: Longitude

---

## Review Endpoints

### Get Reviews

**URL**: `/restaurants/:restaurantId/reviews`
**Method**: `GET`

### Create Review

**URL**: `/restaurants/:restaurantId/reviews`
**Method**: `POST`
**Auth Required**: Yes (customer)
**Body**:
```json
{
  "order": "order_id",
  "rating": 5,
  "comment": "Great food!"
}
```

---

## Real-time Events (Socket.io)

The server emits the following events:

- `orderPlaced`: When a new order is placed
- `orderStatusUpdated`: When order status changes
- `orderAssigned`: When delivery person is assigned

Listen to these events on the client-side for real-time updates.

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Common Status Codes

- **200**: Success
- **201**: Resource created
- **400**: Bad request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not found
- **500**: Server error
