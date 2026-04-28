/**
 * Create or update the primary admin account.
 * Run: npm run seed:admin
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const ADMIN = {
  name: 'Ramzan',
  email: 'ramzan@gmail.com',
  password: 'ramzan@123!',
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const hashed = await bcrypt.hash(ADMIN.password, 10);

  const existing = await User.findOne({ role: 'admin' });

  if (existing) {
    await User.updateOne(
      { _id: existing._id },
      { name: ADMIN.name, email: ADMIN.email, password: hashed }
    );
    console.log(`Admin updated → email: ${ADMIN.email}`);
  } else {
    await User.create({ name: ADMIN.name, email: ADMIN.email, password: hashed, role: 'admin' });
    console.log(`Admin created → email: ${ADMIN.email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
