import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Startup from "@/models/Startup";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    let query: any = { slug: { $ne: null } };

    if (search) {
      query.$or = [
        { category: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const startups = await Startup.find(query)
      .populate("author", "_id name username bio profilePicture")
      .sort({ createdAt: -1 })
      .lean();

    const formattedStartups = startups.map((startup) => ({
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
            bio: (startup.author as any).bio,
            profilePicture: (startup.author as any).profilePicture,
          }
        : null,
      views: startup.views,
      description: startup.description,
      category: startup.category,
      image: startup.image,
      pitch: startup.pitch,
    }));

    return NextResponse.json(formattedStartups, { status: 200 });
  } catch (error) {
    console.error("Error fetching startups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { title, description, category, image, pitch } = body;

    if (!title || !description || !category || !image || !pitch) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find user by email or id
    const user = await User.findOne({
      $or: [{ email: session.user.email }, { _id: (session.user as any).id }],
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const startup = new Startup({
      title,
      description,
      category,
      image,
      pitch,
      author: user._id,
    });

    await startup.save();
    await startup.populate("author", "_id name username bio profilePicture");

    const formattedStartup = {
      _id: startup._id.toString(),
      title: startup.title,
      slug: {
        _type: "slug",
        current: startup.slug,
      },
      _createdAt: startup.createdAt.toISOString(),
      author: {
        _id: startup.author._id.toString(),
        name: (startup.author as any).name,
        username: (startup.author as any).username,
        bio: (startup.author as any).bio,
        profilePicture: (startup.author as any).profilePicture,
      },
      views: startup.views,
      description: startup.description,
      category: startup.category,
      image: startup.image,
      pitch: startup.pitch,
    };

    return NextResponse.json(formattedStartup, { status: 201 });
  } catch (error) {
    console.error("Error creating startup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
