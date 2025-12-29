import { NextResponse } from "next/server";
import { createServerClient } from "../../lib/supabase";

// DELETE: Admin deletes a live bid
export async function DELETE(req) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");
		
		if (!id) {
			return NextResponse.json({ error: "Missing id" }, { status: 400 });
		}

		const supabase = createServerClient();
		
		const { error } = await supabase
			.from('livebids')
			.delete()
			.eq('id', id);

		if (error) {
			console.error("LiveBids DELETE error:", error.message);
			return NextResponse.json({ error: "Bid not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("LiveBids DELETE error:", err);
		return NextResponse.json({ error: "Network error" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const supabase = createServerClient();
		
		const { data: bids, error } = await supabase
			.from('livebids')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			console.error("LiveBids GET error:", error.message);
			return NextResponse.json({ error: "Failed to fetch bids" }, { status: 500 });
		}

		return NextResponse.json({ bids: bids || [] });
	} catch (err) {
		console.error("LiveBids GET error:", err);
		return NextResponse.json({ error: "Network error" }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const { stockName, value, quantity } = await req.json();
		
		if (!stockName || !value || !quantity) {
			return NextResponse.json({ error: "Missing fields" }, { status: 400 });
		}

		const supabase = createServerClient();
		
		const { data: bid, error } = await supabase
			.from('livebids')
			.insert([{ stockName, value, quantity, status: 'inactive', bids: [] }])
			.select()
			.single();

		if (error) {
			console.error("LiveBids POST error:", error.message);
			return NextResponse.json({ error: "Failed to create bid" }, { status: 400 });
		}

		return NextResponse.json({ success: true, bid });
	} catch (err) {
		console.error("LiveBids POST error:", err);
		return NextResponse.json({ error: "Network error" }, { status: 500 });
	}
}

export async function PUT(req) {
	try {
		const { id, action } = await req.json();
		
		if (!id || !action) {
			return NextResponse.json({ error: "Missing fields" }, { status: 400 });
		}

		const supabase = createServerClient();
		
		// Fetch the bid
		const { data: bid, error: fetchError } = await supabase
			.from('livebids')
			.select('*')
			.eq('id', id)
			.single();

		if (fetchError || !bid) {
			console.error("LiveBids PUT error:", fetchError?.message);
			return NextResponse.json({ error: "Bid not found" }, { status: 404 });
		}

		if (action === "start") {
			const { data: updatedBid, error } = await supabase
				.from('livebids')
				.update({ status: "active" })
				.eq('id', id)
				.select()
				.single();

			if (error) {
				console.error("LiveBids PUT start error:", error.message);
				return NextResponse.json({ error: "Failed to update bid" }, { status: 500 });
			}

			return NextResponse.json({ success: true, bid: updatedBid });
		}

		if (action === "stop") {
			const { data: updatedBid, error } = await supabase
				.from('livebids')
				.update({ status: "inactive" })
				.eq('id', id)
				.select()
				.single();

			if (error) {
				console.error("LiveBids PUT stop error:", error.message);
				return NextResponse.json({ error: "Failed to update bid" }, { status: 500 });
			}

			return NextResponse.json({ success: true, bid: updatedBid });
		}

		if (action === "award") {
			if (!bid.bids || bid.bids.length === 0) {
				return NextResponse.json({ error: "No bids placed" }, { status: 400 });
			}

			// Find the highest bid
			const highest = bid.bids.reduce((max, b) => b.value > max.value ? b : max, bid.bids[0]);
			
			// Fetch the winner user
			const { data: user, error: userError } = await supabase
				.from('users')
				.select('*')
				.eq('username', highest.user)
				.single();

			if (userError || !user) {
				console.error("LiveBids PUT award error:", userError?.message);
				return NextResponse.json({ error: "Winner not found" }, { status: 404 });
			}

			if (user.balance < highest.value) {
				return NextResponse.json({ error: "Insufficient balance for winner" }, { status: 400 });
			}

			// Update user balance and stocks
			let holdings = Array.isArray(user.stocks) ? [...user.stocks] : [];
			const idx = holdings.findIndex(h => h.stockName === bid.stockName);
			
			if (idx >= 0) {
				const prevQty = holdings[idx].quantity;
				const prevAvg = holdings[idx].avgPrice;
				const newQty = prevQty + bid.quantity;
				const newAvg = ((prevAvg * prevQty) + highest.value) / newQty;
				
				holdings[idx].quantity = newQty;
				holdings[idx].avgPrice = newAvg;
			} else {
				holdings.push({ 
					stockId: "bid:" + bid.id, 
					stockName: bid.stockName, 
					quantity: bid.quantity, 
					avgPrice: highest.value / bid.quantity 
				});
			}

			// Update bid status and winner
			const { error: bidUpdateError } = await supabase
				.from('livebids')
				.update({ status: "awarded", winner: highest.user })
				.eq('id', id);

			if (bidUpdateError) {
				console.error("LiveBids PUT award bid update error:", bidUpdateError.message);
				return NextResponse.json({ error: "Failed to update bid" }, { status: 500 });
			}

			// Update user
			const { error: userUpdateError } = await supabase
				.from('users')
				.update({ 
					balance: user.balance - highest.value,
					stocks: holdings
				})
				.eq('username', highest.user);

			if (userUpdateError) {
				console.error("LiveBids PUT award user update error:", userUpdateError.message);
				return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
			}

			return NextResponse.json({ 
				success: true, 
				winner: highest.user, 
				bidAmount: highest.value,
				quantity: bid.quantity,
				stockName: bid.stockName
			});
		}

		return NextResponse.json({ error: "Invalid action" }, { status: 400 });
	} catch (err) {
		console.error("LiveBids PUT error:", err);
		return NextResponse.json({ error: "Network error" }, { status: 500 });
	}
}
