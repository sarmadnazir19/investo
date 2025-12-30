import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./userModel.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });





  const user = new User({
    username,
    password: hashedPassword,
    stocks: [],
    balance: 10000,
  });

  await user.save();
  console.log("Seeded user:", username);
  await mongoose.disconnect();


seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
