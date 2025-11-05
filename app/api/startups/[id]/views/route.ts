import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Startup from "@/models/Startup";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const startup = await Startup.findById(id).select("views").lean();

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    return NextResponse.json(
      { _id: id, views: startup.views || 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching views:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const startup = await Startup.findById(id);

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    startup.views = (startup.views || 0) + 1;
    await startup.save();

    return NextResponse.json(
      { _id: id, views: startup.views },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating views:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
