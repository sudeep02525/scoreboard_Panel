const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  role: { type: String, enum: ['batsman', 'bowler', 'allrounder', 'wicketkeeper'], default: 'batsman' },
  isCaptain: { type: Boolean, default: false },
  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    catches: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
