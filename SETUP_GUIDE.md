# DabbeWale Setup Guide

## Issues Fixed

### 1. CORS Configuration
- **Problem**: Server was only allowing requests from `https://dabbewale.netlify.app`
- **Solution**: Added localhost URLs to CORS origins
- **File**: `dabbewala-backend/server.js`

### 2. Database Connection
- **Problem**: Missing environment variables and poor error handling
- **Solution**: Added fallback MongoDB URI and better error messages
- **File**: `dabbewala-backend/config/db.js`

### 3. Frontend Error Handling
- **Problem**: Poor error messages and no debugging information
- **Solution**: Added comprehensive logging and better error messages
- **Files**: `frontend/js/main.js`, `frontend/js/provider-auth.js`

## Setup Instructions

### 1. Install Dependencies
```bash
cd dabbewala-backend
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the `dabbewala-backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/dabbewala
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Install and Start MongoDB

#### Option A: Local MongoDB
1. Download and install MongoDB Community Server
2. Start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster
3. Get connection string and replace `MONGO_URI` in `.env`

### 4. Start the Backend Server
```bash
cd dabbewala-backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
🔌 Attempting to connect to MongoDB...
✅ MongoDB Connected Successfully!
📦 Connected to database: dabbewala
```

### 5. Test the Connection
Open `test-connection.html` in your browser to test:
- Server connection
- User registration
- User login

### 6. Start Frontend
Open any HTML file in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

## Troubleshooting

### If MongoDB Connection Fails:
1. **Check if MongoDB is running**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

2. **Check MongoDB status**:
   ```bash
   mongo --eval "db.runCommand('ping')"
   ```

3. **Use MongoDB Atlas** (recommended for beginners):
   - Sign up at MongoDB Atlas
   - Create a free cluster
   - Get connection string
   - Update `.env` file

### If CORS Errors Occur:
- Check browser console for CORS errors
- Ensure backend is running on port 5000
- Verify CORS configuration in `server.js`

### If Data Still Not Saving:
1. **Check browser console** for JavaScript errors
2. **Check server console** for backend errors
3. **Use test-connection.html** to isolate issues
4. **Verify MongoDB connection** in server logs

## File Changes Made

### Backend Changes:
1. **server.js**: Fixed CORS, added test route
2. **config/db.js**: Better error handling, fallback URI
3. **controllers/authController.js**: Already working correctly

### Frontend Changes:
1. **main.js**: Added logging and better error handling
2. **provider-auth.js**: Improved error handling and user feedback
3. **test-connection.html**: Created for testing

## Testing Steps

1. **Start backend**: `npm run dev` in `dabbewala-backend`
2. **Open test page**: `test-connection.html` in browser
3. **Test registration**: Use the test form
4. **Check MongoDB**: Verify data appears in database
5. **Test login**: Use registered credentials

## Common Issues and Solutions

### Issue: "MongoDB Connection Error"
**Solution**: Install MongoDB or use MongoDB Atlas

### Issue: "CORS error" in browser
**Solution**: Backend server not running or CORS not configured

### Issue: "Registration failed" 
**Solution**: Check server logs for specific error messages

### Issue: Data not appearing in MongoDB
**Solution**: 
1. Check if MongoDB is actually running
2. Verify connection string in `.env`
3. Check server console for connection success message

## Next Steps

After successful setup:
1. Test user registration and login
2. Test provider registration and login
3. Verify data appears in MongoDB
4. Test order placement from the `order-placement.html` page.
5. Check the `delivery-dashboard.html` to see new orders.

## Support

If issues persist:
1. Check browser console (F12)
2. Check server console for errors
3. Use `test-connection.html` to isolate problems
4. Verify MongoDB installation and connection 