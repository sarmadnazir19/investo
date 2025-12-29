import { NextResponse } from "next/server";
import { createServerClient } from "../../lib/supabase";

export async function POST(req) {
  try {
    const { userId, stockId, quantity } = await req.json();

    if (!userId || !stockId || !quantity || Number(quantity) <= 0) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    const supabase = createServerClient();

    // 1️⃣ Fetch user balance
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, balance")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("BUY: user not found", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2️⃣ Fetch stock
    const { data: stock, error: stockError } = await supabase
      .from("stocks")
      .select("id, StockValue")
      .eq("id", stockId)
      .single();

    if (stockError || !stock) {
      console.error("BUY: invalid stock", stockError);
      return NextResponse.json({ error: "Invalid stock selected" }, { status: 400 });
    }

    const totalCost = Number(stock.StockValue) * qty;

    // 3️⃣ Check balance
    if (Number(user.balance) < totalCost) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    // 4️⃣ Deduct balance
    const { error: updateBalanceError } = await supabase
      .from("users")
      .update({ balance: Number(user.balance) - totalCost })
      .eq("id", userId);

    if (updateBalanceError) {
      console.error("BUY: failed update balance", updateBalanceError);
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
    }

    // 5️⃣ Update or insert holding
    const { data: existingHolding, error: holdingFetchError } = await supabase
      .from("holdings")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("stock_id", stockId)
      .single();

    if (holdingFetchError && holdingFetchError.code !== "PGRST116") {
      console.error("BUY: holding fetch error", holdingFetchError);
      return NextResponse.json({ error: "Holding check failed" }, { status: 500 });
    }

    if (existingHolding && existingHolding.id) {
      const { error: updateHoldErr } = await supabase
        .from("holdings")
        .update({ quantity: Number(existingHolding.quantity) + qty })
        .eq("id", existingHolding.id);
      if (updateHoldErr) {
        console.error("BUY: update holding failed", updateHoldErr);
        return NextResponse.json({ error: "Failed to update holding" }, { status: 500 });
      }
    } else {
      const { error: insertHoldErr } = await supabase
        .from("holdings")
        .insert([{ user_id: userId, stock_id: stockId, quantity: qty }]);
      if (insertHoldErr) {
        console.error("BUY: insert holding failed", insertHoldErr);
        return NextResponse.json({ error: "Failed to create holding" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("BUY ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
