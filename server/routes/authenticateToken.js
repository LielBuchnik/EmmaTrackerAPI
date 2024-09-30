const jwt = require('jsonwebtoken');
const JWT_SECRET = 'AdsadnAUUUSKd@!#!askdanasd@$!%@^135AD@1151asd@';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Get token from Authorization header

  if (!token) return res.sendStatus(401); // No token, unauthorized

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token, forbidden
    req.user = user; // Attach decoded user information to the request
    console.log(req.user);
    next();
  });
};

module.exports = { authenticateToken };
