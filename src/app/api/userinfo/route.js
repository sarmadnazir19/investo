import { NextResponse } from "next/server";
import { createServerClient } from "../../lib/supabase";
import { verifyAuthToken } from "../../lib/auth";

export async function GET(req) {
	try {
		const cookie = req.cookies.get("auth_token")?.value;
		if (!cookie) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}

		const { username } = verifyAuthToken(cookie) || {};
		if (!username) {
			return NextResponse.json({ error: "Invalid token" }, { status: 401 });
		}

		const supabase = createServerClient();
		
		const { data: user, error } = await supabase
			.from('users')
			.select('username, balance, stocks')
			.eq('username', username)
			.single();

		if (error || !user) {
			console.error("Userinfo error:", error?.message);
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ 
			username: user.username, 
			balance: user.balance || 10000, 
			stocks: user.stocks || [] 
		});
	} catch (error) {
		console.error("Userinfo error:", error);
		return NextResponse.json({ 
			error: "Network error. Please try again." 
		}, { status: 500 });
	}
}
