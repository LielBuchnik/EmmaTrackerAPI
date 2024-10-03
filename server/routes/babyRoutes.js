const express = require('express');
const multer = require('multer');
const router = express.Router();
const { Baby, Food, BloodSugar, sequelize } = require('../models');
const { Op } = require('sequelize'); 
const { authenticateToken } = require('./authenticateToken');

// Set up multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 50 * 1024 * 1024 } // Limit to 50MB 
});

// Function to convert file buffer to Base64 string
const convertImageToBase64 = (fileBuffer) => {
  return fileBuffer.toString('base64');
};
// Get all babies
router.get('/babies', authenticateToken, async (req, res) => {
  try {
    const babies = await Baby.findAll({ where: { userId: req.user.id } }); 
    res.json(babies);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching babies' });
  }
});

// Route to create a new baby with base64 image
router.post('/babies', authenticateToken, upload.single('image'), async (req, res) => {
  const { name, birthdate, gender } = req.body;
  const imageBase64 = req.file ? req.file.buffer.toString('base64') : ''; // Convert uploaded file to base64
  console.log("Received data:", { name, birthdate, gender, imageBase64 });

  try {
    // Store baby details including the Base64 image string in the database
    const newBaby = await Baby.create({
      name,
      birthdate,
      gender,
      image: imageBase64 || '', // Store the Base64 string of the image
      userId: req.user.id, // Assume the user is authenticated and their ID is in the token
    });

    console.log("Baby created successfully:", newBaby);
    res.json(newBaby);
  } catch (error) {
    console.error("Error adding baby:", error);
    res.status(500).json({ error: 'Error adding baby', details: error.message });
  }
});

// Route to fetch baby details
router.get('/babies/:id', authenticateToken, async (req, res) => {
  try {
    const baby = await Baby.findOne({ where: { id: req.params.id } });

    if (!baby) {
      return res.status(404).json({ error: 'Baby not found' });
    }

    res.json(baby);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching baby details' });
  }
});


// Route to update baby with base64 image
router.put('/babies/:id', authenticateToken, async (req, res) => {
  const { name, birthdate, gender, imageBase64 } = req.body;

  try {
    const baby = await Baby.findByPk(req.params.id);

    if (!baby || baby.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to edit this baby' });
    }

    // Update baby details and image
    baby.name = name || baby.name;
    baby.birthdate = birthdate || baby.birthdate;
    baby.gender = gender || baby.gender;
    baby.image = imageBase64 || baby.image; // Update base64 image if provided

    await baby.save();
    res.json(baby);
  } catch (error) {
    res.status(500).json({ error: 'Error updating baby' });
  }
});

// Delete baby
router.delete('/babies/:id', authenticateToken, async (req, res) => {
  try {
    const baby = await Baby.findByPk(req.params.id);

    if (baby.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this baby' });
    }

    await baby.destroy();
    res.json({ message: 'Baby deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting baby' });
  }
});

// Get feeding logs with related blood sugar data, with optional limit query
router.get('/babies/:id/foods', authenticateToken, async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10; 
  try {
    const foods = await Food.findAll({
      where: { babyId: req.params.id },
      order: [['time', 'DESC']],
      limit, 
    });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feeding logs' });
  }
});


// Add feeding log with notes
router.post('/babies/:id/foods', authenticateToken, async (req, res) => {
  const { type, quantity, time, notes } = req.body; // Include notes
  const newFood = await Food.create({
    type,
    quantity,
    time,
    notes, // Save notes to the database
    babyId: req.params.id,
  });
  res.json(newFood);
});

// Add feeding log with optional blood sugar record
router.post('/babies/:id/foods-and-blood-sugar', authenticateToken, async (req, res) => {
  const { type, quantity, time, notes, bloodSugar } = req.body;
  const t = await sequelize.transaction();

  try {
    const newFood = await Food.create({
      type,
      quantity,
      time,
      notes,
      babyId: req.params.id,
    }, { transaction: t });

    if (bloodSugar && bloodSugar.level) {
      await BloodSugar.create({
        level: bloodSugar.level,
        measurementTime: bloodSugar.measurementTime || time,
        notes: bloodSugar.notes || null,
        babyId: req.params.id,
        foodId: newFood.id, 
      }, { transaction: t });
    }

    await t.commit();
    res.json({ message: 'Feeding and blood sugar logs added successfully', newFood });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error adding feeding and blood sugar data' });
  }
});

// Route to get blood sugar data for all babies of the authenticated user
router.get('/babies-all/blood-sugars', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // Extract date range from query params
    
    // Base query options
    const queryOptions = {
      include: {
        model: Baby,
        where: { userId: req.user.id }, // Filter by user ID
        attributes: ['name'], // Include baby name to distinguish data
      },
    };

    // Add date range filter only if both startDate and endDate are provided
    if (startDate && endDate) {
      queryOptions.where = {
        measurementTime: {
          [Op.between]: [startDate, endDate], // Filter by date range using Op.between
        },
      };
    }

    const bloodSugars = await BloodSugar.findAll(queryOptions);

    if (!bloodSugars.length) {
      return res.status(404).json({ error: 'No blood sugar records found' });
    }

    res.json(bloodSugars);
  } catch (error) {
    console.error('Error fetching all blood sugar data', error);
    res.status(500).json({ error: 'Error fetching all blood sugar data' });
  }
});


// Route to get food logs for all babies of the authenticated user
router.get('/babies-all/foods', authenticateToken, async (req, res) => {
  try {
    const foods = await Food.findAll({
      include: {
        model: Baby,
        where: { userId: req.user.id }, // Filter by user ID
        attributes: ['name'], // Include baby name to distinguish data
      },
    });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching all food logs' });
  }
});


module.exports = router;
