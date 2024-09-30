const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

// Secret for JWT
const JWT_SECRET = 'AdsadnAUUUSKd@!#!askdanasd@$!%@^135AD@1151asd@';

// Sign up route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUser || existingUsername) {
      return res.status(400).json({ error: 'משתמש או שם משתמש כבר קיים' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    res.json({ message: 'המשתמש נוצר בהצלחה', user });
  } catch (error) {
    res.status(500).json({ error: 'שגיאת שרת בעת הרשמה' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password, rememberMe } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: 'שם משתמש או סיסמה שגויים' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'שם משתמש או סיסמה שגויים' });

    const tokenExpiration = rememberMe ? '90d' : '1h';
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: tokenExpiration });

    res.json({ message: 'התחברת בהצלחה', token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'שגיאת שרת בעת התחברות' });
  }
});

// Middleware to check if a user is authenticated
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract Bearer token
  if (!token) return res.sendStatus(401); // Unauthorized if no token

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden if token is invalid
    req.user = user;
    next();
  });
};

module.exports = { router, authenticateToken };