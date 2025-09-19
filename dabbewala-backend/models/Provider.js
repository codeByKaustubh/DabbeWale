const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], default: "lunch" },
  isVegetarian: { type: Boolean, default: true },
  allergens: [String],
  available: { type: Boolean, default: true }
});

const providerSchema = new mongoose.Schema({
  actualName: { type: String, required: true },
  providerName: { type: String, required: true },
  menu: { type: String, required: true },
  prices: { type:String, required: true },
  location: {type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: { type: String, required: true },
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  description: String,
  cuisine: [String],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  menu: [menuItemSchema],
  deliveryRadius: { type: Number, default: 5 }, // in km
  deliveryFee: { type: Number, default: 0 },
  minOrderAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  images: [String],
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, {
  timestamps: true
});

module.exports = mongoose.model("Provider", providerSchema); 