const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Provider = require("../models/Provider");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User (Consumer, Provider, or Delivery Agent)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, providerName, menu, prices, location, phone } = req.body;
    
    // Check if a user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists with this email" });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    
    // 1. Always create a User record first for authentication purposes.
    const newUser = new User({ 
      name: name, 
      email, 
      password: hashedPass,
      role: role || 'consumer' // Default to 'consumer' if role is not provided
    });
    await newUser.save();

    // 2. If the role is 'provider', create a corresponding Provider profile.
    if (role === 'provider') {
      const newProvider = new Provider({
        actualName: name,
        providerName: providerName,
        email: email, // Keep email for easier querying
        password: hashedPass,
        phone: phone,
        menu: menu,
        prices: prices,
        location: location,
        address: {
          city: location
        },
        owner: newUser._id // Link the provider profile to the new User account
      });
      
      await newProvider.save();
    }

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    // Log the detailed error on the server for debugging
    console.error("💥 Registration Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Login User (Consumer, Provider, or Delivery Agent)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", email);
    
    // The User model is now the single source of truth for login credentials.
    let user = await User.findOne({ email });
    let providerId = null;
    
    // If the user is a provider, find their associated provider profile to get the providerId.
    if (user && user.role === 'provider') {
      const providerProfile = await Provider.findOne({ owner: user._id });
      if (providerProfile) providerId = providerProfile._id;
    }
    
    if (!user) {
      console.log("❌ Login failed: user not found for", email);
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Login failed: invalid password for", email);
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "change_this";
    const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";
    
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role || 'consumer', 
        name: user.name, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    console.log("✅ Login success for", email, "as", userType);
    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role || 'consumer',
        providerId: providerId
      },
    });
  } catch (err) {
    console.error("💥 Login error for", req.body && req.body.email, ":", err.message);
    res.status(500).json({ msg: "Login error", error: err.message });
  }
});

module.exports = router;
