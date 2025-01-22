const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { name, username, email, password } = req.body;

  // Basic validation
  if (!name || !username || !email || !password) {
    return res
      .status(400)
      .json({
        error:
          "Please provide all required fields: name, username, email, and password.",
      });
  }

  // Check email format (basic regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res
        .status(400)
        .json({ error: "Username already exists. Please choose another one." });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res
        .status(400)
        .json({
          error: "Email already in use. Please log in or use another email.",
        });
    }

    // Create and save the new user
    const user = new User({ name, username, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { login, password } = req.body; // Expecting "login" (email or username) and "password"
  
  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Compare provided password with stored hash
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials!" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful!",
      token,
      user: { id: user._id, name: user.name, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error); // Log error for debugging
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

module.exports = router;
