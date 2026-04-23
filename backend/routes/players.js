const router = require('express').Router();
const Player = require('../models/Player');
const Team = require('../models/Team');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const os = require('os');
const upload = multer({ dest: os.tmpdir() });
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
    if (team.players.length >= 7) return res.status(400).json({ message: 'Team already has 7 players' });
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

// Import players from CSV (admin)
router.post('/import', protect, adminOnly, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a CSV file' });
  
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        let importedCount = 0;
        for (const p of results) {
          if (!p.name || !p.teamName) continue;

          let team = await Team.findOne({ name: { $regex: new RegExp(`^${p.teamName.trim()}$`, 'i') } });
          if (!team) continue;

          // Check if player already exists in this team to avoid duplicates
          const existing = await Player.findOne({ name: p.name.trim(), team: team._id });
          if (existing) continue;

          const player = await Player.create({
            name: p.name.trim(),
            team: team._id,
            role: (p.role || 'batsman').trim().toLowerCase(),
            stats: {
              matches: parseInt(p.matches) || 0,
              runs: parseInt(p.runs) || 0,
              wickets: parseInt(p.wickets) || 0,
              catches: parseInt(p.catches) || 0,
            }
          });

          team.players.push(player._id);
          await team.save();
          importedCount++;
        }
        
        fs.unlinkSync(req.file.path);
        res.json({ message: `Successfully imported ${importedCount} players` });
      } catch (err) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: err.message });
      }
    });
});

module.exports = router;
