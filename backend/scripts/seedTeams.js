/**
 * Seed initial teams for APL Season 8.
 * Run: node scripts/seedTeams.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Team from '../models/Team.js';

dotenv.config();

const TEAMS = [
  { name: 'Royal Challengers',  group: 'A' },
  { name: 'Axion',              group: 'A' },
  { name: 'Syndicate',          group: 'A' },
  { name: '404 NOT FOUND',      group: 'A' },
  { name: '401 UNAUTHORISED',   group: 'B' },
  { name: 'Strikers',           group: 'B' },
  { name: 'Chase Masters',      group: 'B' },
  { name: 'Elite Warriors',     group: 'B' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  for (const { name, group } of TEAMS) {
    const existing = await Team.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (!existing) {
      await Team.create({ name, group });
      console.log(`Created: ${name} (Group ${group})`);
    } else {
      console.log(`Skipped (exists): ${name}`);
    }
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
