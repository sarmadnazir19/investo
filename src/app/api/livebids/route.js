import { NextResponse } from "next/server";
import { connectToDatabase } from "../_db";
import LiveBid from "../liveBidModel";
import User from "../userModel";

// GET: Fetch all live bids
export async function GET() {
  await connectToDatabase();
  const bids = await LiveBid.find({});
  return NextResponse.json({ bids });
}

// POST: Admin creates a new live bid
export async function POST(req) {
  await connectToDatabase();
  const { stockName, value, quantity } = await req.json();
  if (!stockName || !value || !quantity) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const bid = new LiveBid({ stockName, value, quantity });
  await bid.save();
  return NextResponse.json({ success: true, bid });
}

// PUT: Admin starts/stops a bid, or awards to highest bidder
export async function PUT(req) {
  await connectToDatabase();
  const { id, action } = await req.json();
  const bid = await LiveBid.findById(id);
  if (!bid) return NextResponse.json({ error: "Bid not found" }, { status: 404 });

  if (action === "start") {
    bid.status = "active";
    await bid.save();
    return NextResponse.json({ success: true, bid });
  }
  if (action === "stop") {
    bid.status = "inactive";
    await bid.save();
    return NextResponse.json({ success: true, bid });
  }
  if (action === "award") {
    if (!bid.bids.length) return NextResponse.json({ error: "No bids placed" }, { status: 400 });
    // Find highest bid
    const highest = bid.bids.reduce((max, b) => b.value > max.value ? b : max, bid.bids[0]);
    bid.status = "awarded";
    bid.winner = highest.user;
    await bid.save();
    // Deduct balance and add stock to winner's holdings
    const user = await User.findOne({ username: highest.user });
    if (!user) return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    if (user.balance < highest.value) return NextResponse.json({ error: "Insufficient balance for winner" }, { status: 400 });
    user.balance -= highest.value;
    // Add stock to holdings
    let holdings = Array.isArray(user.stocks) ? [...user.stocks] : [];
    const idx = holdings.findIndex(h => h.stockName === bid.stockName);
    if (idx >= 0) {
      holdings[idx].quantity += bid.quantity;
      // Weighted avg price
      holdings[idx].avgPrice = ((holdings[idx].avgPrice * holdings[idx].quantity) + highest.value) / (holdings[idx].quantity + bid.quantity);
    } else {
      holdings.push({ stockId: "bid:"+bid._id, stockName: bid.stockName, quantity: bid.quantity, avgPrice: highest.value });
    }
    user.stocks = holdings;
    await user.save();
    return NextResponse.json({ success: true, winner: highest.user });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
