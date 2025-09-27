const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const Provider = require("../models/Provider");
const DeliveryAgent = require("../models/DeliveryAgent");

// All agent routes require authentication; any logged-in agent/user can view basic lists
router.use(protect);

// Get users (consumers)
router.get("/users", async (req, res) => {
  try {
    const { limit = 50, page = 1, q = "" } = req.query;
    const filter = q ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] } : {};
    const items = await User.find(filter)
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch users", error: err.message });
  }
});

// Get providers
router.get("/providers", async (req, res) => {
  try {
    const { limit = 50, page = 1, q = "" } = req.query;
    const filter = q ? { $or: [{ providerName: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] } : {};
    const items = await Provider.find(filter)
      .select("providerName email address rating totalRatings createdAt")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Provider.countDocuments(filter);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch providers", error: err.message });
  }
});

// Get delivery agents
router.get("/agents", async (req, res) => {
  try {
    const { limit = 50, page = 1, q = "" } = req.query;
    const filter = q ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] } : {};
    const items = await DeliveryAgent.find(filter)
      .select("name email phone vehicleType serviceArea createdAt")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await DeliveryAgent.countDocuments(filter);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch agents", error: err.message });
  }
});
