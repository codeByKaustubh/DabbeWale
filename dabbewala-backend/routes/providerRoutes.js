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


// Register provider directly into Provider collection
router.post("/register", async (req, res) => {
  try {
    const { name, actualName, providerName, menu, prices, location, email, password, phone } = req.body;
    
    // Check if a user or provider already exists with this email
    const userExists = await User.findOne({ email });
    const providerExists = await Provider.findOne({ email });
    if (userExists || providerExists) {
      return res.status(400).json({ msg: "A user with this email already exists." });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    // 1. Create the User record for authentication
    const newUser = new User({
      name: actualName || name,
      email,
      password: hashedPass,
      role: 'provider'
    });
    await newUser.save();

    // 2. Create the Provider profile and link it to the new User
    const newProvider = new Provider({
      actualName: actualName || name,
      providerName,
      menu,
      prices,
      location,
      email, // Keep email for easier querying
      password: hashedPass, // Keep hashed password for direct provider login if needed
      phone,
      address: { city: location },
      owner: newUser._id // Link to the User model
    });

    await newProvider.save();

    res.status(201).json({ message: "Provider registered successfully" });
  } catch (err) {
    console.error("Provider registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
