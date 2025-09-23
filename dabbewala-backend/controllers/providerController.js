const Provider = require("../models/Provider");
const User = require("../models/User");
const Order = require("../models/Order");

// Register a new provider
exports.registerProvider = async (req, res) => {
  try {
    const user = req.user; // comes from protect middleware (JWT)

    // Ensure user has provider role
    if (!user || user.role !== "provider") {
      return res.status(403).json({ msg: "Only users with provider role can register as provider" });
    }

    // Check if provider profile already exists for this user
    const existingProvider = await Provider.findOne({ owner: user._id });
    if (existingProvider) {
      return res.status(400).json({ msg: "Provider profile already exists" });
    }

    // Create provider profile
    const provider = await Provider.create({
      name: req.body.name,
      email: user.email,       // always from User
      phone: req.body.phone,
      address: req.body.address,
      description: req.body.description,
      cuisine: req.body.cuisine,
      owner: user._id          // link to User
    });

    res.status(201).json({
      msg: "Provider registered successfully",
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        city: provider.address?.city
      }
    });
  } catch (err) {
    console.error("RegisterProvider error:", err);
    res.status(500).json({ msg: "Provider registration error", error: err.message });
  }
};


// Get all providers with optional filters
exports.getProviders = async (req, res) => {
  try {
    const { city, cuisine, rating, limit = 20, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    if (city) {
      query["address.city"] = { $regex: city, $options: "i" };
    }
    
    if (cuisine) {
      query.cuisine = { $in: [cuisine] };
    }
    
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    const providers = await Provider.find(query)
      .select("name description address rating totalRatings cuisine images")
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ rating: -1, totalRatings: -1 });

    const total = await Provider.countDocuments(query);

    res.json({
      providers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching providers", error: err.message });
  }
};

// Get provider by ID
exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate("owner", "name email")
      .select("-__v");

    if (!provider) {
      return res.status(404).json({ msg: "Provider not found" });
    }

    res.json(provider);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching provider", error: err.message });
  }
};

// Update provider
exports.updateProvider = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({ msg: "Provider not found" });
    }

    res.json({ msg: "Provider updated successfully", provider });
  } catch (err) {
    res.status(500).json({ msg: "Error updating provider", error: err.message });
  }
};

// Add menu item to provider
exports.addMenuItem = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({ msg: "Provider not found" });
    }

    provider.menu.push(req.body);
    await provider.save();

    res.status(201).json({ msg: "Menu item added successfully", menuItem: provider.menu[provider.menu.length - 1] });
  } catch (err) {
    res.status(500).json({ msg: "Error adding menu item", error: err.message });
  }
};

// Search providers by location
exports.searchProviders = async (req, res) => {
  try {
    const { location, radius = 10 } = req.query;
    
    if (!location) {
      return res.status(400).json({ msg: "Location is required" });
    }

    // Simple text-based search for now
    // In production, you'd want to implement geospatial queries
    const providers = await Provider.find({
      isActive: true,
      $or: [
        { "address.city": { $regex: location, $options: "i" } },
        { "address.street": { $regex: location, $options: "i" } },
        { name: { $regex: location, $options: "i" } }
      ]
    })
    .select("name description address rating totalRatings cuisine images")
    .sort({ rating: -1 });

    res.json({ providers, searchLocation: location });
  } catch (err) {
    res.status(500).json({ msg: "Error searching providers", error: err.message });
  }
};

// Get orders for a specific provider
exports.getProviderOrders = async (req, res) => {
  try {
    const providerId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;

    // Ensure provider can only access their own orders
    if (req.userType === 'provider' && req.user._id.toString() !== providerId) {
      return res.status(403).json({ msg: "Not authorized to access this provider's data" });
    }

    // Fetch orders for the provider, populate customer and provider details
    const orders = await Order.find({ provider: providerId })
      .populate('customer', 'name email phone')
      .populate('provider', 'name address')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching provider orders", error: err.message });
  }
};
