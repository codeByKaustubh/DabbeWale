const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: ["http://localhost:5000", "http://127.0.0.1:5000", "http://localhost:3000", "http://127.0.0.1:3000", "https://dabbewale.netlify.app"],
  credentials: true
}));

app.use(express.json());

// Seed a default admin user if missing
async function seedDefaultAdmin() {
  try {
    const email = "admin@gmail.com";
    const existing = await User.findOne({ email });
    if (!existing) {
      const passwordHash = await bcrypt.hash("admin", 10);
      await User.create({ name: "Admin", email, password: passwordHash, role: "admin" });
      console.log("✅ Seeded default admin: admin@gmail.com / admin");
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
  await seedDefaultAdmin();
});


