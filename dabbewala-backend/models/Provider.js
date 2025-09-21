const mongoose = require("mongoose");

// Simplified Provider schema to align with the current registration form

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['Vegetarian', 'Non-Vegetarian'], default: 'Vegetarian' },
  category: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], default: 'Lunch' },
  description: String,
  image: String,
  available: { type: Boolean, default: true }
});

const providerSchema = new mongoose.Schema({
  actualName: { type: String, required: true },
  providerName: { type: String, required: true },
  menu: [menuItemSchema], // Changed to array of menu items
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
  // Note: we are not using embedded menu items currently
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