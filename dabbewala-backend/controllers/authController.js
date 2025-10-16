const User = require("../models/User");
const Provider = require("../models/Provider")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change_this";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";



exports.registerUser = async (req, res) => {
  const { name, email, password, role, providerName, menu, prices, location, phone, actualName } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name: actualName || name, email, password: hashedPassword, role: role || 'consumer' });

    // If the role is 'provider', create a corresponding Provider document
    if (role === 'provider') {
      const providerExists = await Provider.findOne({ email });
      if (providerExists) {
        // This is an edge case, but good to handle.
        // We might want to roll back user creation or handle it differently.
        return res.status(400).json({ msg: "A provider with this email already exists." });
      }

      await Provider.create({
        owner: user._id, // Link the provider profile to the user account
        actualName: actualName || name,
        providerName: providerName || `${name}'s Kitchen`,
        email: email,
        phone: phone || 'N/A',
        location: location || 'N/A',
        address: { city: location || 'N/A' },
        menu: menu || [],
        prices: prices || 'N/A'
      });
    }
    // Return the new user's data so the frontend can auto-login
    res.status(201).json({
      msg: "User registered successfully",
      user: {
        email: user.email,
        password: password // Send back the plain password for auto-login
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Registration error", error: err.message });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    // If user is a provider, find their associated provider profile ID
    let providerId = null;
    if (user.role === 'provider') {
      const providerProfile = await Provider.findOne({ owner: user._id });
      if (providerProfile) {
        providerId = providerProfile._id;
      }
    }

    const token = jwt.sign(
  { id: user._id, role: user.role, name: user.name, email: user.email },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES }
);


    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, providerId: providerId },
    });
  } catch (err) {
    res.status(500).json({ msg: "Login error", error: err.message });
  }
};