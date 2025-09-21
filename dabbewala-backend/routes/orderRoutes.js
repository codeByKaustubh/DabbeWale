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
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.post("/:id/rate", protect, rateOrder);

// Provider routes
router.put("/:id/status", protect, updateOrderStatus);
router.get("/provider/:providerId", protect, getProviderOrders);

module.exports = router; 