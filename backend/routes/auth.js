const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register (users only)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ token: generateToken(user), user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login (admin + users)
router.post('/login', async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;
    console.log(`Login attempt for: ${email}`);
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log(`Password mismatch for: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log(`Login successful: ${email}`);
    res.json({ token: generateToken(user), user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
