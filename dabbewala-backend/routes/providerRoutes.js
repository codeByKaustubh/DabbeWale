const express = require("express");
const router = express.Router();
const Provider = require("../models/Provider");
const bcrypt = require("bcryptjs");

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
