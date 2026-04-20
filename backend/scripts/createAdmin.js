// Run: node scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email: 'sudeepdas2525@zohomail.in' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }
  const hashed = await bcrypt.hash('Sudeep@1234567890', 10);
  await User.create({ name: 'Sudeep Das', email: 'sudeepdas2525@zohomail.in', password: hashed, role: 'admin' });
  console.log('Admin created — email: sudeepdas2525@zohomail.in | password: Sudeep@1234567890');
  process.exit(0);
}

main();
