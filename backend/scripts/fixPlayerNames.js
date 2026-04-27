import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Match from '../models/Match.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function fixPlayerNames() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Get all live matches
    const matches = await Match.find({ status: 'live' });
    console.log(`Found ${matches.length} live matches`);

    for (const match of matches) {
      let updated = false;

      // Check innings1
      if (match.innings1) {
        // If currentBatsmen exists but players are null/undefined
        if (match.innings1.currentBatsmen && match.innings1.currentBatsmen.length > 0) {
          const hasNullPlayers = match.innings1.currentBatsmen.some(b => !b.player);
          if (hasNullPlayers) {
            console.log(`Match ${match._id}: innings1 has null players, clearing currentBatsmen`);
            match.innings1.currentBatsmen = [];
            updated = true;
          }
        }
        
        // If currentBowler exists but player is null
        if (match.innings1.currentBowler && !match.innings1.currentBowler.player) {
          console.log(`Match ${match._id}: innings1 currentBowler has null player, clearing`);
          match.innings1.currentBowler = { player: null, overs: 0, balls: 0, runs: 0, wickets: 0 };
          updated = true;
        }
      }

      // Check innings2
      if (match.innings2) {
        if (match.innings2.currentBatsmen && match.innings2.currentBatsmen.length > 0) {
          const hasNullPlayers = match.innings2.currentBatsmen.some(b => !b.player);
          if (hasNullPlayers) {
            console.log(`Match ${match._id}: innings2 has null players, clearing currentBatsmen`);
            match.innings2.currentBatsmen = [];
            updated = true;
          }
        }
        
        if (match.innings2.currentBowler && !match.innings2.currentBowler.player) {
          console.log(`Match ${match._id}: innings2 currentBowler has null player, clearing`);
          match.innings2.currentBowler = { player: null, overs: 0, balls: 0, runs: 0, wickets: 0 };
          updated = true;
        }
      }

      if (updated) {
        await match.save();
        console.log(`Match ${match._id}: Updated successfully`);
      }
    }

    console.log('\n✅ All matches fixed!');
    console.log('\nNext steps:');
    console.log('1. Go to admin panel');
    console.log('2. Open the match score page');
    console.log('3. Select striker, non-striker, and bowler');
    console.log('4. Click "Set Players" or add a ball');
    console.log('5. Player names will now show properly!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPlayerNames();
