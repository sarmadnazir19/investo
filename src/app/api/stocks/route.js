import Stocks from "../stocksModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stocks = await Stocks.find({});
    return NextResponse.json({ stocks });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { StockName, StockValue } = await req.json();
    const stock = new Stocks({ StockName, StockValue });
    await stock.save();
    return NextResponse.json({ stock });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    const { id, StockValue } = await req.json();
    const stock = await Stocks.findByIdAndUpdate(id, { StockValue }, { new: true });
    return NextResponse.json({ stock });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await Stocks.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
