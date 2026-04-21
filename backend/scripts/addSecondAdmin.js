// Run: node scripts/addSecondAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const existing = await User.findOne({ email: 'visheshjaiswar009@gmail.com' });
  if (existing) {
    console.log('Admin already exists with this email');
    process.exit(0);
  }
  
  const hashed = await bcrypt.hash('12345678@@@@', 10);
  await User.create({ 
    name: 'Vishesh Jaiswar', 
    email: 'visheshjaiswar009@gmail.com', 
    password: hashed, 
    role: 'admin' 
  });
  
  console.log('Second Admin created successfully!');
  console.log('Email: visheshjaiswar009@gmail.com');
  console.log('Password: 12345678@@@@');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
