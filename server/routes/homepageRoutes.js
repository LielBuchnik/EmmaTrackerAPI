// routes/homepageRoutes.js
const express = require('express');
const { authenticateToken } = require('./authRoutes');
const { User, Baby } = require('../models'); // Include Baby model

const router = express.Router();

// Protected homepage route with baby data
router.get('/homepage', authenticateToken, async (req, res) => {
  try {
    // Fetch user and associated babies
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Baby, as: 'babies' }] // Include the babies associated with the user
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: `שלום, ${user.username}`,
      babies: user.babies // Return the user's babies
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching user data' });
  }
});

module.exports = router;
