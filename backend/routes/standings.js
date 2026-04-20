const router = require('express').Router();
const Team = require('../models/Team');

// Get standings for a group
router.get('/:group', async (req, res) => {
  try {
    const teams = await Team.find({ group: req.params.group.toUpperCase() })
      .sort({ 'stats.points': -1, 'stats.nrr': -1 })
      .select('name group stats');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all standings
router.get('/', async (req, res) => {
  try {
    const groupA = await Team.find({ group: 'A' }).sort({ 'stats.points': -1 }).select('name group stats');
    const groupB = await Team.find({ group: 'B' }).sort({ 'stats.points': -1 }).select('name group stats');
    res.json({ groupA, groupB });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
