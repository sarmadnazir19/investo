
import { NextResponse } from "next/server";
import { connectToDatabase } from "../_db";
import User from "../userModel";
import bcrypt from "bcryptjs";

export async function POST(req) {
	await connectToDatabase();
	const { username, password } = await req.json();
	if (!username || !password) {
		return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
	}
		const user = await User.findOne({ username });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
		}
	// Set a simple session cookie (for demo, not secure for production)
	const response = NextResponse.json({ success: true, user: { username: user.username, balance: user.balance, stocks: user.stocks } });
	response.cookies.set("user", JSON.stringify({ username: user.username }), { path: "/", httpOnly: true });
	return response;
}
