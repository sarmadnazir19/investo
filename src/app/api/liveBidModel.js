import mongoose from "mongoose";

const BidSchema = new mongoose.Schema({
  user: { type: String, required: true }, // username
  value: { type: Number, required: true },
});

const LiveBidSchema = new mongoose.Schema({
  stockName: { type: String, required: true },
  value: { type: Number, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ["active", "inactive", "awarded"], default: "inactive" },
  bids: { type: [BidSchema], default: [] },
  winner: { type: String }, // username of winner
});

export default mongoose.models.LiveBid || mongoose.model("LiveBid", LiveBidSchema);
