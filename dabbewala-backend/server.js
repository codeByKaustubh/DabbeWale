const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: ["http://localhost:5000", "http://127.0.0.1:5000", "http://localhost:3000", "http://127.0.0.1:3000", "https://dabbewale.netlify.app"],
  credentials: true
}));

app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


