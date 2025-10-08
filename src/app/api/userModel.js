import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  stocks: [{
    stockId: { type: String, required: true },
    stockName: { type: String, required: true },
    quantity: { type: Number, required: true },
    avgPrice: { type: Number, required: true }
  }],
  balance: { type: Number, default: 10000 },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
