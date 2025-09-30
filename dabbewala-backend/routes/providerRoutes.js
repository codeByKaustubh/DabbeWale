const express = require("express");
const router = express.Router();
const Provider = require("../models/Provider");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const { getProviderById, getProviderOrders } = require("../controllers/providerController");

// Get providers (optionally filter by city or search)
router.get("/", async (req, res) => {
  try {
    const { city = "", q = "", limit = 50, page = 1 } = req.query;
    const query = { isActive: { $ne: false } };
    if (city) {
      // Match either address.city or legacy location field (case-insensitive)
      query.$or = [
        { "address.city": { $regex: city, $options: "i" } },
        { location: { $regex: city, $options: "i" } }
      ];
    }
    if (q) {
      const text = { $regex: q, $options: "i" };
      query.$or = (query.$or || []).concat([
        { providerName: text },
        { actualName: text },
        { email: text }
      ]);
    }

    const providers = await Provider.find(query)
      .sort({ rating: -1, totalRatings: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({ providers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get provider by ID
router.get("/:id", protect, getProviderById);

// Get provider's recent orders (protected route)
router.get("/:id/orders", protect, getProviderOrders);

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
