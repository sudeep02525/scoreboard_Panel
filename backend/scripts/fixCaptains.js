/**
 * Fix duplicate captains — keep only the first captain per team.
 * Run: node scripts/fixCaptains.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Player from '../models/Player.js';
import Team from '../models/Team.js';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const teams = await Team.find();
  let fixed = 0;

  for (const team of teams) {
    const captains = await Player.find({ team: team._id, isCaptain: true });
    if (captains.length > 1) {
      // Keep the first, demote the rest
      const [keep, ...demote] = captains;
      const ids = demote.map(p => p._id);
      await Player.updateMany({ _id: { $in: ids } }, { isCaptain: false });
      console.log(`Team "${team.name}": kept captain "${keep.name}", demoted ${demote.map(p => p.name).join(', ')}`);
      fixed += demote.length;
    }
  }

  console.log(fixed > 0 ? `Fixed ${fixed} duplicate captain(s).` : 'No duplicates found.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
