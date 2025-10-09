import { NextResponse } from "next/server";
import { connectToDatabase } from "../../_db";
import LiveBid from "../../liveBidModel";
import User from "../../userModel";



export async function POST(req) {
  await connectToDatabase();
  const { id, user, value } = await req.json();
  if (!id || !user || !value) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const bid = await LiveBid.findById(id);
  if (!bid) return NextResponse.json({ error: "Bid not found" }, { status: 404 });
  if (bid.status !== "active") return NextResponse.json({ error: "Bidding not active" }, { status: 400 });
  const minBid = Number(bid.value) * Number(bid.quantity);
  if (Number(value) <= minBid) {
    return NextResponse.json({ error: `Bid must be greater than $${minBid} (qty x value)` }, { status: 400 });
  }

  // Check if user has sufficient funds
  const userData = await User.findOne({ username: user });
  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (userData.balance < Number(value)) {
    return NextResponse.json({ 
      error: `Insufficient funds. Your balance: $${userData.balance.toLocaleString()}, Required: $${Number(value).toLocaleString()}` 
    }, { status: 400 });
  }

  // Check if user already placed a bid
  const existing = bid.bids.find(b => b.user === user);
  if (existing) {
    existing.value = value; 
  } else {
    bid.bids.push({ user, value });
  }
  await bid.save();
  return NextResponse.json({ success: true, bid });
}
