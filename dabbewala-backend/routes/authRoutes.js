const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { check, validationResult } = require("express-validator");

// Register a new user (handles both consumers and providers)
router.post(
	"/register",
	[
		check("email").isEmail().withMessage("Valid email required"),
		check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
		check("name").notEmpty().withMessage("Name is required"),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
		return registerUser(req, res, next);
	}
);

// Login a user
router.post(
	"/login",
	[check("email").isEmail(), check("password").exists()],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
		return loginUser(req, res, next);
	}
);

module.exports = router;
