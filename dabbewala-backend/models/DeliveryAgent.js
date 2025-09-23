const mongoose = require("mongoose");

const DeliveryAgentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    vehicleType: { type: String, enum: ["bike", "scooter", "bicycle", "car", "walk", "other"], default: "bike" },
    serviceArea: {
      city: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    role: { type: String, default: "delivery_agent" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryAgent", DeliveryAgentSchema);


