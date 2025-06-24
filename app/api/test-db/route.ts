import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: "MongoDB connection successful!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "MongoDB connection failed." }, { status: 500 });
  }
}
