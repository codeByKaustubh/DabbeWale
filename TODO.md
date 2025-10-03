# Remove Delivery Feature from Project

## Backend Changes
- [x] Delete `dabbewala-backend/models/DeliveryAgent.js`
- [x] Edit `dabbewala-backend/models/Order.js`: Remove delivery-related fields (deliveryAddress, deliveryFee, deliveryInstructions, estimatedDeliveryTime, actualDeliveryTime), update status enum to remove "out_for_delivery", "delivered"
- [x] Edit `dabbewala-backend/controllers/orderController.js`: Remove delivery logic from createOrder, updateOrderStatus, rateOrder
- [x] Delete `dabbewala-backend/routes/agentRoutes.js`
- [x] Edit `dabbewala-backend/routes/adminRoutes.js`: Remove agents route and DeliveryAgent import
- [x] Edit `dabbewala-backend/routes/authRoutes.js`: Remove delivery agent registration and login
- [x] Edit `dabbewala-backend/middleware/auth.js`: Remove DeliveryAgent import and logic

## Frontend Changes
- [ ] Edit `cart.html`: Remove delivery address fields, update special instructions label
- [ ] Edit `frontend/js/order-placement.js`: Remove address collection, update order data to remove delivery fields

## Testing
- [ ] Run backend server and test order creation without delivery
- [ ] Test frontend order placement
