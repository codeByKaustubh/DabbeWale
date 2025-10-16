const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  specialInstructions: String
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  paymentMethod: {
  type: String,
  enum: ["online", "card", "upi", "qr", "cod"],
  default: "cod"
  },
  deliveryInstructions: String,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  rating: { type: Number, min: 1, max: 5 },
  review: String
}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema); 