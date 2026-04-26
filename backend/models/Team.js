import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  group: { type: String, enum: ['A', 'B'], required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  stats: {
    played: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    nrr: { type: Number, default: 0 }, // net run rate
  },
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
