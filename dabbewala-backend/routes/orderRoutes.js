const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  rateOrder,
  getProviderOrders
} = require("../controllers/orderController");

// Customer routes
router.post("/", protect, authorize("consumer"), createOrder);
router.get("/my-orders", protect, authorize("consumer"), getUserOrders);
router.get("/:id", protect, getOrderById);
router.post("/:id/rate", protect, authorize("consumer"), rateOrder);

// Provider routes
router.put("/:id/status", protect, authorize("provider"), updateOrderStatus);
router.get("/provider/:providerId", protect, authorize("provider"), getProviderOrders);

module.exports = router; 