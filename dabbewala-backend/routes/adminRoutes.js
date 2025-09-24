const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");
const Provider = require("../models/Provider");
const DeliveryAgent = require("../models/DeliveryAgent");
const Order = require("../models/Order");

// All admin routes require admin role
router.use(protect);
router.use(authorize("admin"));

// Users (consumers and any user entries)
router.get("/users", async (req, res) => {
  try {
    const { limit = 50, page = 1, q = "" } = req.query;
    const filter = q ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] } : {};
    const items = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch users", error: err.message });
  }
});

// Providers
router.get("/providers", async (req, res) => {
  try {
    const { limit = 50, page = 1, q = "" } = req.query;
    const filter = q ? { $or: [{ providerName: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] } : {};
    const items = await Provider.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Provider.countDocuments(filter);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch providers", error: err.message });
  }
});

// Delivery Agents
router.get("/agents", async (req, res) => {
  try {
    const { limit = 50, page = 1, q = "" } = req.query;
    const filter = q ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] } : {};
    const items = await DeliveryAgent.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await DeliveryAgent.countDocuments(filter);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch agents", error: err.message });
  }
});

// Orders (basic summary)
router.get("/orders", async (req, res) => {
  try {
    const { limit = 50, page = 1, status = "" } = req.query;
    const filter = status ? { status } : {};
    const items = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate("customer", "name email")
      .populate("provider", "providerName email");
    const total = await Order.countDocuments(filter);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch orders", error: err.message });
  }
});

module.exports = router;


