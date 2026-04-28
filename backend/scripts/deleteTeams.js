/**
 * Delete specific teams and their players from the database.
 * Run: node scripts/deleteTeams.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Team from '../models/Team.js';
import Player from '../models/Player.js';

dotenv.config();

const TEAMS_TO_DELETE = ['khatarnak Riders', 'Hagde Riders'];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  for (const name of TEAMS_TO_DELETE) {
    const team = await Team.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (team) {
      const playerCount = await Player.countDocuments({ team: team._id });
      await Player.deleteMany({ team: team._id });
      await Team.findByIdAndDelete(team._id);
      console.log(`Deleted team "${team.name}" and ${playerCount} player(s)`);
    } else {
      console.log(`Team not found: "${name}"`);
    }
  }

  console.log('Done.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
