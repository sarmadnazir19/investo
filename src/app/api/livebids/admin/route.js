import { NextResponse } from "next/server";
import { connectToDatabase } from "../../_db";
import LiveBid from "../../liveBidModel";


export async function GET(req) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const bid = await LiveBid.findById(id);
  if (!bid) return NextResponse.json({ error: "Bid not found" }, { status: 404 });
  return NextResponse.json({ bids: bid.bids });
}
