import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

async function updatePassword() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'visheshjaiswar009@gmail.com';
  const newPassword = '12345678@@@@';
  const hashed = await bcrypt.hash(newPassword, 10);
  
  await User.updateOne({ email }, { password: hashed });
  console.log(`Password for ${email} has been successfully updated.`);
  process.exit(0);
}

updatePassword();
