const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Provider = require("../models/Provider");
const DeliveryAgent = require("../models/DeliveryAgent");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ msg: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's a provider, delivery agent, or user
    let user;
    if (decoded.role === 'provider') {
      user = await Provider.findById(decoded.id).select("-password");
    } else if (decoded.role === 'delivery_agent') {
      user = await DeliveryAgent.findById(decoded.id).select("-password");
    } else {
      user = await User.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({ msg: "Not authorized, user not found" });
    }

    req.user = user;
    req.userType = decoded.role === 'provider' ? 'provider' : (decoded.role === 'delivery_agent' ? 'delivery_agent' : 'user');
    next();
  } catch (err) {
    res.status(401).json({ msg: "Not authorized, token failed" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize }; 