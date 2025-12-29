import { NextResponse } from "next/server";
import { createServerClient } from "../../../lib/supabase";

export async function POST(req) {
	try {
		const { id, user, value } = await req.json();
		
		if (!id || !user || !value) {
			return NextResponse.json({ error: "Missing fields" }, { status: 400 });
		}

		const supabase = createServerClient();
		
		// Fetch the bid
		const { data: bid, error: bidError } = await supabase
			.from('livebids')
			.select('*')
			.eq('id', id)
			.single();

		if (bidError || !bid) {
			console.error("LiveBids place error:", bidError?.message);
			return NextResponse.json({ error: "Bid not found" }, { status: 404 });
		}

		if (bid.status !== "active") {
			return NextResponse.json({ error: "Bidding not active" }, { status: 400 });
		}

		const minBid = Number(bid.value) * Number(bid.quantity);
		if (Number(value) <= minBid) {
			return NextResponse.json({ error: `Bid must be greater than $${minBid} (qty x value)` }, { status: 400 });
		}

		// Check if user has sufficient funds
		const { data: userData, error: userError } = await supabase
			.from('users')
			.select('*')
			.eq('username', user)
			.single();

		if (userError || !userData) {
			console.error("LiveBids place user error:", userError?.message);
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		if (userData.balance < Number(value)) {
			return NextResponse.json({ 
				error: `Insufficient funds. Your balance: $${userData.balance.toLocaleString()}, Required: $${Number(value).toLocaleString()}` 
			}, { status: 400 });
		}

		// Update bids array
		let bids = Array.isArray(bid.bids) ? [...bid.bids] : [];
		const existingIndex = bids.findIndex(b => b.user === user);
		
		if (existingIndex >= 0) {
			bids[existingIndex].value = value;
		} else {
			bids.push({ user, value });
		}

		// Update the bid in Supabase
		const { data: updatedBid, error: updateError } = await supabase
			.from('livebids')
			.update({ bids })
			.eq('id', id)
			.select()
			.single();

		if (updateError) {
			console.error("LiveBids place update error:", updateError.message);
			return NextResponse.json({ error: "Failed to update bid" }, { status: 500 });
		}

		return NextResponse.json({ success: true, bid: updatedBid });
	} catch (err) {
		console.error("LiveBids place error:", err);
		return NextResponse.json({ error: "Network error" }, { status: 500 });
	}
}
