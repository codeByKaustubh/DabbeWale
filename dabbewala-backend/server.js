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

// Flexible CORS configuration for local development and production
const allowedOrigins = [
  "https://dabbewale.netlify.app", // Production frontend
  "http://localhost:3000",
  "http://localhost:8000", // Common local server port
  "http://127.0.0.1:5500"  // For Live Server extension
];
app.use(cors({ origin: (origin, callback) => {
  // Allow requests with no origin (like mobile apps or curl requests) or from whitelisted domains
  if (!origin || allowedOrigins.includes(origin)) { callback(null, true); } 
  else { callback(new Error('Not allowed by CORS')); }
}}));

// Connect DB (this already prints your custom logs!)
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/providers", require("./routes/providerRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/agent", require("./routes/agentRoutes"));
app.use("/api/directory", require("./routes/directoryRoutes"));


// Test route for admin panel API check
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ API is reachable" });
});


// Health check route
app.get("/", (req, res) => {
  res.json({ message: "✅ Server is running", timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
