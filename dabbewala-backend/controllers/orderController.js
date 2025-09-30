const Order = require("../models/Order");
const Provider = require("../models/Provider");
const User = require("../models/User");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { providerId, items, deliveryAddress, deliveryInstructions, paymentMethod } = req.body;
    
    // Check if user is a consumer. The role is 'consumer', not 'user'.
    if (req.user.role !== 'consumer') {
      return res.status(403).json({ msg: "Only consumers can place orders" });
    }
    
    const customerId = req.user._id; // From auth middleware

    // Verify provider exists and is active
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ msg: "Provider not found" });
    }

    // --- Secure Price Calculation ---
    // The backend, not the frontend, must be the source of truth for prices.
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      // Find the menu item in the provider's menu from the database
      const menuItemFromDB = provider.menu.find(
        (menuItem) => menuItem._id.toString() === item.menuItemId
      );

      if (!menuItemFromDB) {
        return res.status(400).json({ msg: `Item '${item.name}' not found in provider's menu.` });
      }

      // Use the price from the database, NOT the price from the request body
      const itemTotal = menuItemFromDB.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItem: menuItemFromDB._id,
        name: menuItemFromDB.name,
        price: menuItemFromDB.price, // Use the secure price
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || ''
      });
    }

    const deliveryFee = 0; // Free delivery for now
    const tax = totalAmount * 0.05; // 5% tax
    const finalAmount = totalAmount + deliveryFee + tax;

    console.log("Creating order with data:", {
      customer: customerId,
      provider: providerId,
      items: orderItems,
      totalAmount,
      deliveryFee,
      tax,
      finalAmount,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod
    });

    try {
      const order = await Order.create({
        customer: customerId,
        provider: providerId,
        items: orderItems,
        totalAmount,
        deliveryFee,
        tax,
        finalAmount,
        deliveryAddress,
        deliveryInstructions,
        paymentMethod
      });

      console.log("Order created successfully:", order._id);

      res.status(201).json({
        msg: "Order created successfully",
        order: {
          _id: order._id,
          totalAmount: order.totalAmount,
          finalAmount: order.finalAmount,
          status: order.status
        }
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Removed the mock order creation block. We want to see the real database error.
      res.status(500).json({ msg: "Database error while creating order", error: dbError.message });
    }
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ msg: "Error creating order", error: err.message });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { customer: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("provider", "name address")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching orders", error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("provider", "name address phone");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Check if user is authorized to view this order
    if (order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching order", error: err.message });
  }
};

// Update order status (for providers)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate("provider");
    
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Check if user is the provider or admin
    if (order.provider.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to update this order" });
    }

    order.status = status;
    
    if (status === "delivered") {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    res.json({ msg: "Order status updated successfully", order });
  } catch (err) {
    res.status(500).json({ msg: "Error updating order status", error: err.message });
  }
};

// Rate and review order
exports.rateOrder = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Check if user is the customer
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to rate this order" });
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      return res.status(400).json({ msg: "Can only rate delivered orders" });
    }

    order.rating = rating;
    order.review = review;
    await order.save();

    // Update provider's average rating
    const provider = await Provider.findById(order.provider);
    if (provider) {
      const allOrders = await Order.find({ 
        provider: order.provider, 
        rating: { $exists: true, $ne: null } 
      });
      
      const totalRating = allOrders.reduce((sum, order) => sum + order.rating, 0);
      provider.rating = totalRating / allOrders.length;
      provider.totalRatings = allOrders.length;
      await provider.save();
    }

    res.json({ msg: "Order rated successfully", order });
  } catch (err) {
    res.status(500).json({ msg: "Error rating order", error: err.message });
  }
};

// Get provider's orders (for provider dashboard)
exports.getProviderOrders = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const { status, page = 1, limit = 10 } = req.query;

    // Verify provider ownership
    const provider = await Provider.findById(providerId);
    if (!provider || provider.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to view these orders" });
    }

    let query = { provider: providerId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching provider orders", error: err.message });
  }
}; 