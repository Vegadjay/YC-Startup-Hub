import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Startup from "@/models/Startup";
import User from "@/models/User";
import { Types } from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Ensure the User model is registered on the active connection for populate
    await import("@/models/User");

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid startup id" },
        { status: 400 }
      );
    }

    const startup = await Startup.findById(id)
      .populate("author", "_id name username bio profilePicture")
      .lean();

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    const formattedStartup = {
      _id: startup._id.toString(),
      title: startup.title,
      slug: {
        _type: "slug",
        current: startup.slug,
      },
      _createdAt: startup.createdAt.toISOString(),
      author: startup.author
        ? {
            _id: (startup.author as any)._id.toString(),
            name: (startup.author as any).name,
            username: (startup.author as any).username,
            bio: (startup.author as any).bio,
            profilePicture: (startup.author as any).profilePicture,
          }
        : null,
      views: startup.views,
      description: startup.description,
      category: startup.category,
      image: startup.image,
      pitch: startup.pitch,
    };

    return NextResponse.json(formattedStartup, { status: 200 });
  } catch (error) {
    console.error("Error fetching startup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
