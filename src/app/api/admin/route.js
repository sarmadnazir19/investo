import { NextResponse } from "next/server";
import { connectToDatabase } from "../_db";
import User from "../userModel";
import bcrypt from "bcryptjs";

export async function GET() {
  await connectToDatabase();
  const users = await User.find({}, "username balance");
  return NextResponse.json({ users });
}

export async function POST(req) {
  await connectToDatabase();
  const { username, password, balance } = await req.json();
  if (!username || !password || balance == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, balance, stocks: [] });
  await user.save();
  return NextResponse.json({ success: true, user: { username, balance } });
}

export async function PUT(req) {
  await connectToDatabase();
  const { username, balance } = await req.json();
  if (!username || balance == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const user = await User.findOneAndUpdate({ username }, { balance }, { new: true });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, user: { username, balance: user.balance } });
}

export async function DELETE(req) {
  await connectToDatabase();
  const { username } = await req.json();
  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }
  await User.deleteOne({ username });
  return NextResponse.json({ success: true });
}
