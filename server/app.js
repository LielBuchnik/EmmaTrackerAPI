const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const babyRoutes = require('./routes/babyRoutes');
const bloodSugarRoutes = require('./routes/bloodSugarRoutes'); 
const homepageRoutes = require('./routes/homepageRoutes'); // Import the new route file
const { router: authRoutes } = require('./routes/authRoutes'); // Import authRoutes
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser()); // Add this line
// Increase the body size limit for JSON and URL-encoded data
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/api', babyRoutes);
app.use('/api', bloodSugarRoutes);
app.use('/api', authRoutes); // Add auth routes
app.use('/api', homepageRoutes); // Now the /api/homepage route will work
// Start server
const PORT = process.env.PORT_SERVER || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
