require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('../models/Team');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const teams = [
    'Royal Challengers', 'Axion', 'syndicate', '404 NOT FOUND', 
    '401 UNAUTHORISED', 'Strikers', 'Chase Masters', 'Elite Warriors'
  ];
  
  for(let i=0; i<teams.length; i++) {
    const name = teams[i];
    const group = i < 4 ? 'A' : 'B';
    const existing = await Team.findOne({ name: { $regex: new RegExp('^'+name+'$', 'i') } });
    if(!existing) {
      await Team.create({ name, group });
      console.log('Created team:', name);
    }
  }
  console.log('Teams ready');
  process.exit(0);
}
seed();
