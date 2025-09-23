const express = require("express");
const router = express.Router();
const Provider = require("../models/Provider");
const { protect } = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const { getProviderOrders } = require("../controllers/providerController");

// Get all providers
router.get("/", async (req, res) => {
  try {
    const providers = await Provider.find({ isActive: true });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get provider by ID
router.get("/:id", async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get provider dashboard stats (protected route)
router.get("/:id/stats", protect, async (req, res) => {
  try {
    const providerId = req.params.id;
    
    // Ensure provider can only access their own stats
    if (req.userType === 'provider' && req.user._id.toString() !== providerId) {
      return res.status(403).json({ msg: "Not authorized to access this provider's data" });
    }
    
    // For now, return mock data. Later we'll connect to Order model
    const stats = {
      totalOrders: 0,
      pendingOrders: 0,
      todayRevenue: 0,
      rating: 0.0,
      totalReviews: 0,
      thisWeekOrders: 0,
      popularItems: []
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get provider's recent orders (protected route)
router.get("/:id/orders", protect, getProviderOrders);

// Register provider directly into Provider collection
router.post("/register", async (req, res) => {
  try {
    const { name, actualName, providerName, menu, prices, location, email, password, phone } = req.body;

    const exists = await Provider.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "Provider already exists with this email" });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const newProvider = new Provider({
      actualName: actualName || name,
      providerName,
      menu,
      prices,
      location,
      email,
      password: hashedPass,
      phone,
      address: { city: location }
    });

    await newProvider.save();
    res.status(201).json({ message: "Provider registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
