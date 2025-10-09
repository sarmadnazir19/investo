import { NextResponse } from "next/server";
import { connectToDatabase } from "../_db";
import User from "../userModel";
import { verifyAuthToken } from "../../lib/auth";

export async function GET(req) {
  await connectToDatabase();
  const cookie = req.cookies.get("auth_token")?.value;
  if (!cookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { username } = verifyAuthToken(cookie) || {};
  if (!username) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ username: user.username, balance: user.balance, stocks: user.stocks });
}
