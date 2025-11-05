"use server";

import { getServerSession } from "next-auth";
import { parseServerActionResponse } from "@/lib/utils";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Startup from "@/models/Startup";
import User from "@/models/User";

export const createPitch = async (
  state: any,
  form: FormData,
  pitch: string
) => {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the session exists and includes user data
    if (!session || !session.user) {
      return parseServerActionResponse({
        error: "Not signed in",
        status: "ERROR",
      });
    }

    const title = form.get("title") as string;
    const description = form.get("description") as string;
    const category = form.get("category") as string;
    const link = form.get("link") as string;

    // Validate required fields
    if (!title || !description || !category || !link) {
      return parseServerActionResponse({
        error: "Missing required fields",
        status: "ERROR",
      });
    }

    await connectDB();

    // Find user by email or id
    const user = await User.findOne({
      $or: [{ email: session.user.email }, { _id: (session.user as any).id }],
    });

    if (!user) {
      return parseServerActionResponse({
        error: "User not found",
        status: "ERROR",
      });
    }

    // Generate slug from title
    let slug: string;
    try {
      const slugifyModule = await import("slugify");
      const slugify = slugifyModule.default || slugifyModule;

      if (typeof slugify !== "function") {
        throw new Error("slugify is not a function");
      }

      let baseSlug = slugify(title, { lower: true, strict: true });

      // Ensure baseSlug is not empty
      if (!baseSlug || baseSlug.trim() === "") {
        baseSlug = `startup-${Date.now()}`;
      }

      slug = baseSlug;
      let counter = 1;

      // Check if slug already exists and generate unique slug
      while (await Startup.exists({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    } catch (slugError) {
      console.error("Error generating slug:", slugError);
      // Fallback slug generation
      slug = `startup-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    // Create startup directly with slug
    const startup = new Startup({
      title,
      description,
      category,
      image: link,
      pitch,
      author: user._id,
      slug,
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

    return parseServerActionResponse({
      ...formattedStartup,
      error: "",
      status: "SUCCESS",
    });
  } catch (error: any) {
    console.error("Error creating pitch:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors: Record<string, string> = {};
      Object.keys(error.errors || {}).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });

      console.error("Validation errors:", validationErrors);

      return parseServerActionResponse({
        error: "Startup validation failed",
        validationErrors,
        status: "ERROR",
      });
    }

    // Handle duplicate key errors (e.g., duplicate slug)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return parseServerActionResponse({
        error: `Duplicate ${field}: This ${field} already exists`,
        status: "ERROR",
      });
    }

    return parseServerActionResponse({
      error: error.message || "An unexpected error occurred",
      status: "ERROR",
    });
  }
};
