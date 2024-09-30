const express = require('express');
const router = express.Router();
const { BloodSugar } = require('../models');

// Get all blood sugar records for a baby
router.get('/babies/:id/blood-sugars', async (req, res) => {
  try {
    const bloodSugars = await BloodSugar.findAll({
      where: { babyId: req.params.id },
      order: [['measurementTime', 'DESC']],
    });
    res.json(bloodSugars);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעת שליפת רשומות הסוכר בדם' });
  }
});

// Add blood sugar log independently
router.post('/babies/:id/blood-sugars', async (req, res) => {
  try {
    const { level, measurementTime, notes } = req.body;
    const newBloodSugar = await BloodSugar.create({
      level,
      measurementTime,
      notes,
      babyId: req.params.id,
    });
    res.json(newBloodSugar);
  } catch (error) {
    res.status(500).json({ error: 'Error adding blood sugar data' });
  }
});

// Update a blood sugar record
router.put('/blood-sugars/:id', async (req, res) => {
  try {
    const { level, measurementTime, notes } = req.body;
    const bloodSugar = await BloodSugar.findByPk(req.params.id);
    if (bloodSugar) {
      bloodSugar.level = level !== undefined ? level : bloodSugar.level;
      bloodSugar.measurementTime = measurementTime || bloodSugar.measurementTime;
      bloodSugar.notes = notes !== undefined ? notes : bloodSugar.notes;  // Handle notes
      await bloodSugar.save();
      res.json(bloodSugar);
    } else {
      res.status(404).json({ error: 'רשומת סוכר בדם לא נמצאה' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעת עדכון רשומת סוכר בדם' });
  }
});

// Delete a blood sugar record
router.delete('/blood-sugars/:id', async (req, res) => {
  try {
    const bloodSugar = await BloodSugar.findByPk(req.params.id);
    if (bloodSugar) {
      await bloodSugar.destroy();
      res.json({ message: 'רשומת סוכר בדם נמחקה' });
    } else {
      res.status(404).json({ error: 'רשומת סוכר בדם לא נמצאה' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעת מחיקת רשומת סוכר בדם' });
  }
});

module.exports = router;
