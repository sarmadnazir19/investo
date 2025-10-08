import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./userModel.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const username = "StonksAdmin";
  const password = "StonksAdmin4321!";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    password: hashedPassword,
    stocks: [],
    balance: 10000,
  });

  await user.save();
  console.log("Seeded user:", username);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
