const router = require('express').Router();
const Player = require('../models/Player');
const Team = require('../models/Team');
const { protect, adminOnly } = require('../middleware/auth');

// Get all players
router.get('/', async (req, res) => {
  try {
    const players = await Player.find().populate('team', 'name group');
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get players by team
router.get('/team/:teamId', async (req, res) => {
  try {
    const players = await Player.find({ team: req.params.teamId });
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add player (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const team = await Team.findById(req.body.team);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.players.length >= 8) return res.status(400).json({ message: 'Team already has 8 players' });
    const player = await Player.create(req.body);
    team.players.push(player._id);
    await team.save();
    res.status(201).json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update player (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete player (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    await Team.findByIdAndUpdate(player.team, { $pull: { players: player._id } });
    res.json({ message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
