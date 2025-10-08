import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  stocks: { type: Array, default: [] },
  balance: { type: Number, default: 10000 },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
