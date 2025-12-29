import { NextResponse } from "next/server";
import { createServerClient } from "../../lib/supabase";

export async function GET() {
	try {
		const supabase = createServerClient();
		
		const { data: stocks, error } = await supabase
			.from('stocks')
			.select('*')
			.order('StockName', { ascending: true });

		if (error) {
			console.error("Stocks GET error:", error.message);
			return NextResponse.json({ error: "Failed to fetch stocks" }, { status: 500 });
		}

		return NextResponse.json({ stocks: stocks || [] });
	} catch (err) {
		console.error("Stocks GET error:", err);
		return NextResponse.json({ error: "Network error" }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const { StockName, StockValue } = await req.json();
		
		if (!StockName || StockValue == null) {
			return NextResponse.json({ error: "Missing fields" }, { status: 400 });
		}

		const supabase = createServerClient();
		
		const { data: stock, error } = await supabase
			.from('stocks')
			.insert([{ StockName, StockValue }])
			.select()
			.single();

		if (error) {
			console.error("Stocks POST error:", error.message);
			return NextResponse.json({ error: "Failed to create stock" }, { status: 400 });
		}

		return NextResponse.json({ stock });
	} catch (err) {
		console.error("Stocks POST error:", err);
		return NextResponse.json({ error: "Network error" }, { status: 500 });
	}
}

export async function PUT(req) {
	try {
		const { id, StockValue } = await req.json();
		
		if (!id || StockValue == null) {
			return NextResponse.json({ error: "Missing fields" }, { status: 400 });
		}

		const supabase = createServerClient();
		
		const { data: stock, error } = await supabase
			.from('stocks')
			.update({ StockValue })
			.eq('id', id)
			.select()
			.single();

		if (error || !stock) {
			console.error("Stocks PUT error:", error?.message);
			return NextResponse.json({ error: "Failed to update stock" }, { status: 400 });
		}

		return NextResponse.json({ stock });
	} catch (err) {
		console.error("Stocks PUT error:", err);
		return NextResponse.json({ error: "Network error" }, { status: 500 });
	}
}

export async function DELETE(req) {
	try {
		const { id } = await req.json();
		
		if (!id) {
			return NextResponse.json({ error: "Missing id" }, { status: 400 });
		}

		const supabase = createServerClient();
		
		const { error } = await supabase
			.from('stocks')
			.delete()
			.eq('id', id);

		if (error) {
			console.error("Stocks DELETE error:", error.message);
			return NextResponse.json({ error: "Failed to delete stock" }, { status: 400 });
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Stocks DELETE error:", err);
		return NextResponse.json({ error: "Network error" }, { status: 500 });
	}
}
