const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const app = express();

// CORS: Allow requests from your Netlify frontend and any localhost for development.
// This is more robust for deployment platforms like Render.
const allowedOrigins = ["https://dabbewale.netlify.app"];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
  },
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
    } else {
      const valid = await bcrypt.compare("admin", existing.password).catch(() => false);
      const needsRole = existing.role !== "admin";

      if (needsRole || !valid) {
        existing.role = "admin";
        if (!valid) {
          existing.password = await bcrypt.hash("admin", 10);
        }
        await existing.save();
        console.log("🔁 Ensured admin credentials for admin@gmail.com (password reset to 'admin')");
      }
    }
  } catch (err) {
    console.warn("⚠️ Failed to seed default admin:", err.message);
  }
}

// Routes
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!", timestamp: new Date().toISOString() });
});

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
app.use("/api/agent", require("./routes/agentRoutes"));
app.use("/api/directory", require("./routes/directoryRoutes"));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    await seedDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
