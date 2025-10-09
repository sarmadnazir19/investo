
import { NextResponse } from "next/server";
import { connectToDatabase } from "../_db";
import User from "../userModel";
import bcrypt from "bcryptjs";
import { createAuthToken, setAuthCookie } from "../../lib/auth";

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
			let tokenType = "user";
			let isAdmin = false;
			if (username === "StonksAdmin" && password === "StonksAdmin4321!") {
				tokenType = "admin";
				isAdmin = true;
			}
			const token = createAuthToken(user.username, isAdmin);
			const response = NextResponse.json({ success: true, user: { username: user.username, balance: user.balance, stocks: user.stocks }, tokenType });
			response.cookies.set("auth_token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				path: "/",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			});
			return response;
}
