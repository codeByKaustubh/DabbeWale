const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["https://dabbewale.netlify.app", "http://localhost:3000"],
  credentials: true
}));

// Connect DB (this already prints your custom logs!)
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/providers", require("./routes/providerRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/agent", require("./routes/agentRoutes"));


// Health check route
app.get("/", (req, res) => {
  res.json({ message: "✅ Server is running", timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
