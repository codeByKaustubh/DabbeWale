const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// Register a new user (handles both consumers and providers)
router.post("/register", registerUser);

// Login a user
router.post("/login", loginUser);

module.exports = router;
