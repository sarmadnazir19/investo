import { NextResponse } from "next/server";
import { createServerClient } from "../../lib/supabase";
import { createAuthToken } from "../../lib/auth";

export async function POST(req) {
	try {
		const { username, password } = await req.json();

		if (!username || !password) {
			console.error("Login error: Missing username or password");
			return NextResponse.json(
				{ error: "Missing username or password" },
				{ status: 400 }
			);
		}

		const cleanUsername = username.trim();
		const cleanPassword = password.trim();

		const supabase = createServerClient();

		// Fetch user
		const { data: user, error } = await supabase
			.from("users")
			.select("*")
			.eq("username", cleanUsername)
			.single();

		if (error || !user) {
			console.error("Login error: User not found", error?.message);
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// ✅ PLAIN TEXT PASSWORD CHECK (TEMPORARY)
		if (user.password !== cleanPassword) {
			console.error("Login error: Password mismatch");
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// Admin check (optional)
		let tokenType = "user";
		let isAdmin = false;
		if (
			cleanUsername === "StonksAdmin" &&
			cleanPassword === "StonksAdmin4321!"
		) {
			tokenType = "admin";
			isAdmin = true;
		}

		const token = createAuthToken(user.username, isAdmin);

		const response = NextResponse.json({
			success: true,
			user: {
				username: user.username,
				balance: user.balance ?? 10000,
				stocks: user.stocks ?? [],
			},
			tokenType,
		});

		response.cookies.set("auth_token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		return response;
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Network error" },
			{ status: 500 }
		);
	}
}
