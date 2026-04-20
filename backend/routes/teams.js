const router = require('express').Router();
const Team = require('../models/Team');
const Player = require('../models/Player');
const { protect, adminOnly } = require('../middleware/auth');

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().populate('players');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get teams by group
router.get('/group/:group', async (req, res) => {
  try {
    const teams = await Team.find({ group: req.params.group }).populate('players');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single team
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create team (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update team (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete team (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    await Player.deleteMany({ team: req.params.id });
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
