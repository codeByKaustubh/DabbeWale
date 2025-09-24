const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();
connectDB();

const app = express();

// CORS: allow local dev, Netlify, and file:// (Origin: 'null')
const allowedOrigins = new Set([
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://dabbewale.netlify.app"
]);
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin requests (no Origin header), file:// (Origin: 'null'), and localhost/netlify
    if (!origin || origin === 'null') return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    // Allow any localhost/127.0.0.1 port during development
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/.test(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json());

// Seed a default admin user if missing
async function seedDefaultAdmin() {
  try {
    const email = "admin@gmail.com";
    const existing = await User.findOne({ email });
    const passwordHash = await bcrypt.hash("admin", 10);
    if (!existing) {
      await User.create({ name: "Admin", email, password: passwordHash, role: "admin" });
      console.log("✅ Seeded default admin: admin@gmail.com / admin");
    } else {
      const needsRole = existing.role !== "admin";
      const bcryptjs = require("bcryptjs");
      const valid = await bcryptjs.compare("admin", existing.password).catch(() => false);
      if (needsRole || !valid) {
        existing.role = "admin";
        existing.password = passwordHash;
        await existing.save();
        console.log("🔁 Ensured admin credentials for admin@gmail.com (password reset to 'admin')");
      }
    }
  } catch (err) {
    console.warn("⚠️ Failed to seed default admin:", err.message);
  }
}

// Test route to verify server is working
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!", timestamp: new Date().toISOString() });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const Order = require("./models/Order");
    const count = await Order.countDocuments();
    res.json({ message: "Database connected!", orderCount: count });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/providers", require("./routes/providerRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Seed a default admin user for quick access if none exists
  await seedDefaultAdmin();
});


