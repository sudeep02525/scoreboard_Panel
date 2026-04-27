import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'visheshjaiswar009@gmail.com';
  const password = '12345678@@@@';
  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found in DB');
  } else {
    console.log('User found in DB');
    const match = await bcrypt.compare(password, user.password);
    console.log('Password match:', match);
    if (!match) {
        console.log('Stored hash:', user.password);
        const newHash = await bcrypt.hash(password, 10);
        console.log('New hash would be:', newHash);
    }
  }
  process.exit(0);
}
test();
