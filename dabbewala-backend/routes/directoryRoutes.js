const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const Provider = require("../models/Provider");
const DeliveryAgent = require("../models/DeliveryAgent");

// All directory routes require authentication
router.use(protect);

// Get users (consumers)
router.get("/users", async (req, res) => {
  try {
    const items = await User.find({ role: "consumer" }).select("name email role createdAt").sort({ createdAt: -1 });
    res.json({ items, total: items.length });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch users", error: err.message });
  }
});

// Get providers
router.get("/providers", async (req, res) => {
  try {
    const items = await Provider.find({}).select("providerName email address rating").sort({ createdAt: -1 });
    res.json({ items, total: items.length });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch providers", error: err.message });
  }
});

// Get delivery agents
router.get("/agents", async (req, res) => {
  try {
    const items = await DeliveryAgent.find({}).select("name email phone vehicleType serviceArea").sort({ createdAt: -1 });
    res.json({ items, total: items.length });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch agents", error: err.message });
  }
});

module.exports = router;