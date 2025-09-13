# DabbeWale Backend API

A Node.js/Express backend for the DabbeWale tiffin service platform.

## Features

- 🔐 User Authentication (JWT)
- 👥 User Management (Consumer/Provider roles)
- 🏪 Provider Management
- 📋 Order Management
- ⭐ Rating & Review System
- 🔍 Location-based Provider Search
- 📊 Order Tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for frontend integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dabbewala-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/dabbewale
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Providers
- `GET /api/providers` - Get all providers
- `GET /api/providers/search` - Search providers by location
- `GET /api/providers/:id` - Get provider by ID
- `POST /api/providers/register` - Register a new provider (Protected)
- `PUT /api/providers/:id` - Update provider (Protected)
- `POST /api/providers/:id/menu` - Add menu item (Protected)

### Orders
- `POST /api/orders` - Create a new order (Protected)
- `GET /api/orders/my-orders` - Get user's orders (Protected)
- `GET /api/orders/:id` - Get order by ID (Protected)
- `PUT /api/orders/:id/status` - Update order status (Protected)
- `POST /api/orders/:id/rate` - Rate an order (Protected)
- `GET /api/orders/provider/:providerId` - Get provider's orders (Protected)

## Database Models

### User
- `name` (String)
- `email` (String, unique)
- `password` (String, hashed)
- `role` (String: "consumer" | "provider")

### Provider
- `name` (String)
- `email` (String, unique)
- `phone` (String)
- `address` (Object with city, state, etc.)
- `description` (String)
- `cuisine` (Array of strings)
- `rating` (Number)
- `menu` (Array of menu items)
- `owner` (Reference to User)
- `isActive` (Boolean)
- `isVerified` (Boolean)

### Order
- `customer` (Reference to User)
- `provider` (Reference to Provider)
- `items` (Array of order items)
- `totalAmount` (Number)
- `deliveryFee` (Number)
- `finalAmount` (Number)
- `status` (String: pending, confirmed, etc.)
- `paymentStatus` (String: pending, paid, etc.)
- `deliveryAddress` (Object)
- `rating` (Number, optional)
- `review` (String, optional)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "msg": "Error message",
  "error": "Detailed error information"
}
```

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Project Structure
```
dabbewala-backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── providerController.js
│   └── orderController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Provider.js
│   └── Order.js
├── routes/
│   ├── authRoutes.js
│   ├── providerRoutes.js
│   └── orderRoutes.js
├── server.js
├── package.json
└── README.md
```

## Deployment

### Environment Variables for Production
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dabbewale
JWT_SECRET=your_production_jwt_secret
```

### Deployment Platforms
- **Heroku**: Use Heroku CLI or GitHub integration
- **Railway**: Connect GitHub repository
- **Render**: Connect GitHub repository
- **Vercel**: Connect GitHub repository

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 