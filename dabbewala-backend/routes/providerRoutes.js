const express = require("express");
const router = express.Router();
const Provider = require("../models/Provider");
const { protect } = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const { getProviders, getProviderById, getProviderOrders, getProviderDashboardData } = require("../controllers/providerController");
const User = require("../models/User");

// Get providers (optionally filter by city or search)
router.get("/", getProviders);

// Get provider by ID
router.get("/:id", protect, getProviderById);

// Get provider's recent orders (protected route)
router.get("/:id/orders", protect, getProviderOrders);

// Get provider dashboard stats + orders
router.get("/:id/dashboard", protect, getProviderDashboardData);


// Provider registration is now handled by the general /api/auth/register endpoint

module.exports = router;
