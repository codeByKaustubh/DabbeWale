const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Provider = require("../models/Provider");
const bcrypt = require("bcryptjs");

// Register User (Consumer, Provider, or Delivery Agent)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, providerName, menu, prices, location, phone, vehicleType, serviceArea } = req.body;
    
    // Check if user already exists in either collection
    const existingUser = await User.findOne({ email });
    const existingProvider = await Provider.findOne({ email });
    if (existingUser || existingProvider) {
      return res.status(400).json({ msg: "User already exists with this email" });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    
    if (role === 'provider') {
      // Register as provider - save to Provider collection
      const newProvider = new Provider({
        actualName: name,
        providerName: providerName,
        email: email,
        password: hashedPass,
        phone: phone,
        menu: menu,
        prices: prices,
        location: location,
        address: {
          city: location
        }
      });
      
      await newProvider.save();
      res.status(201).json({ message: "Provider registered successfully" });
    } else if (role === 'delivery_agent') {
      // Register as delivery agent - save to DeliveryAgent collection
      const newAgent = new DeliveryAgent({
        name,
        email,
        password: hashedPass,
        phone,
        vehicleType: vehicleType || 'bike',
        serviceArea: serviceArea || { city: location, pincode: '' },
        role: 'delivery_agent'
      });
      await newAgent.save();
      res.status(201).json({ message: "Delivery agent registered successfully" });
    } else {
      // Register as regular user - save to User collection
      const newUser = new User({ 
        name, 
        email, 
        password: hashedPass,
        role: role || 'consumer'
      });
      await newUser.save();
      res.status(201).json({ message: "User registered successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User (Consumer, Provider, or Delivery Agent)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", email);
    
    // First check in User collection
    let user = await User.findOne({ email });
    let userType = 'user';
    
    // If not found in User collection, check Provider collection
    if (!user) {
      user = await Provider.findOne({ email });
      userType = 'provider';
    }
    // If still not found, check DeliveryAgent collection
    if (!user) {
      user = await DeliveryAgent.findOne({ email });
      userType = 'delivery_agent';
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
    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "change_this";
    const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";
    
    const token = jwt.sign(
      { 
        id: user._id, 
        role: userType === 'provider' ? 'provider' : (userType === 'delivery_agent' ? 'delivery_agent' : (user.role || 'consumer')), 
        name: user.actualName || user.name, 
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
        name: user.actualName || user.name, 
        email: user.email, 
        role: userType === 'provider' ? 'provider' : (userType === 'delivery_agent' ? 'delivery_agent' : (user.role || 'consumer')),
        providerId: userType === 'provider' ? user._id : null
      },
    });
  } catch (err) {
    console.error("💥 Login error for", req.body && req.body.email, ":", err.message);
    res.status(500).json({ msg: "Login error", error: err.message });
  }
});

module.exports = router;
