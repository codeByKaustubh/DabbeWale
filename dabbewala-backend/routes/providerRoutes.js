const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  registerProvider,
  getProviders,
  getProviderById,
  updateProvider,
  addMenuItem,
  searchProviders
} = require("../controllers/providerController");

// Public routes
router.get("/", getProviders);
router.get("/search", searchProviders);
router.get("/:id", getProviderById);

// Protected routes
router.post("/register", protect, authorize("provider"), registerProvider);
router.put("/:id", protect, authorize("provider"), updateProvider);
router.post("/:id/menu", protect, authorize("provider"), addMenuItem);

module.exports = router; 