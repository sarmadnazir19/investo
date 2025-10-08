import News from "../newsModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const news = await News.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ news });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, body } = await req.json();
    const newsItem = new News({ title, body });
    await newsItem.save();
    return NextResponse.json({ news: newsItem });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    const { id, title, body } = await req.json();
    const newsItem = await News.findByIdAndUpdate(id, { title, body }, { new: true });
    return NextResponse.json({ news: newsItem });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await News.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
