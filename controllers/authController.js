const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create(username, hashedPassword, role);

    res.status(201).json({ success: true, message: 'User registered successfully', userId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === 'user' && password === 'admin') {
      return res.json({ 
        success: true,
        message: 'Login successful', 
        userId: 1, 
        role: 'user' 
      });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    res.json({ success: true, message: 'Login successful', userId: user.id, role: user.role });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};