const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();
const app = express();

// Ensure required secrets are set
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set. Exiting.");
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(helmet());

// Flexible CORS configuration for local development and production
const allowedOrigins = [
  "https://dabbewale.netlify.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8000",
  "http://127.0.0.1:5500"
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === "null" || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not allowed by CORS`));
      }
    },
  })
);

// Connect DB
connectDB();

// Basic rate limiter for auth endpoints to mitigate brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { success: false, message: "Too many requests from this IP, please try again later." },
});

// Routes
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/providers", require("./routes/providerRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Test route for admin panel API check
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ API is reachable" });
});

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "✅ Server is running", timestamp: new Date().toISOString() });
});

// Global error handler
app.use(require("./middleware/errorHandler"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
