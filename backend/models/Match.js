const mongoose = require('mongoose');

const inningsSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
  batting: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    status: { type: String, default: 'yet to bat' }, // yet to bat, batting, out, not out
    dismissal: { type: String, default: '' },
  }],
  bowling: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    overs: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
  }],
});

const matchSchema = new mongoose.Schema({
  teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  group: { type: String, enum: ['A', 'B', 'Semi Final 1', 'Semi Final 2', 'Final'] },
  stage: { type: String, enum: ['group', 'semi', 'final'], default: 'group' },
  round: { type: Number, default: 1 }, // 1, 2, 3 for group stage
  ground: { type: String, enum: ['Ground 1', 'Ground 2'], default: 'Ground 1' },
  date: { type: Date },
  status: { type: String, enum: ['scheduled', 'live', 'completed'], default: 'scheduled' },
  tossWinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  tossDecision: { type: String, enum: ['bat', 'field'] },
  innings1: inningsSchema,
  innings2: inningsSchema,
  currentInnings: { type: Number, default: 1 },
  result: {
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    description: { type: String, default: '' },
  },
  overs: { type: Number, default: 6 }, // configurable overs per match
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
