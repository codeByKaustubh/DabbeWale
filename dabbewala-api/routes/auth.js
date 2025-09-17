const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/ping", (req, res) => {
  res.send("Auth route is alive 🚀");
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.json({ message: "User registered successfully ✅" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials ❌" });
    res.json({ message: "Login successful ✅", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
