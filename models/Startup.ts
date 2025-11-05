import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStartup extends Document {
  _id: string;
  title: string;
  slug: string;
  author: mongoose.Types.ObjectId;
  views: number;
  description: string;
  category: string;
  image: string;
  pitch: string;
  createdAt: Date;
  updatedAt: Date;
}

const StartupSchema = new Schema<IStartup>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title must be less than 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    views: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description must be less than 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [20, "Category must be less than 20 characters"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      validate: {
        validator: function (v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "Image must be a valid URL",
      },
    },
    pitch: {
      type: String,
      required: [true, "Pitch is required"],
      minlength: [10, "Pitch must be at least 10 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Create index for search
StartupSchema.index({ title: "text", description: "text", category: "text" });

// Auto-generate slug from title
StartupSchema.pre("save", async function (next) {
  try {
    // Skip slug generation if slug already exists and is valid
    if (this.slug && this.slug.trim() !== "") {
      return next();
    }

    // Ensure title exists before generating slug
    if (!this.title || this.title.trim() === "") {
      return next(new Error("Title is required to generate slug"));
    }

    // Import slugify
    const slugifyModule = await import("slugify");
    const slugify = slugifyModule.default || slugifyModule;

    if (typeof slugify !== "function") {
      throw new Error("slugify is not a function");
    }

    let baseSlug = slugify(this.title, { lower: true, strict: true });

    // Ensure baseSlug is not empty
    if (!baseSlug || baseSlug.trim() === "") {
      baseSlug = `startup-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;

    // Check if slug already exists (only if we have a model)
    const StartupModel = this.constructor;
    if (StartupModel && typeof StartupModel === "function") {
      while (
        await (StartupModel as any).exists({ slug, _id: { $ne: this._id } })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Ensure slug is set
    if (!slug || slug.trim() === "") {
      slug = `startup-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    this.slug = slug;
    next();
  } catch (error) {
    console.error("Error in pre-save hook for slug generation:", error);
    next(error);
  }
});

const Startup: Model<IStartup> =
  mongoose.models.Startup || mongoose.model<IStartup>("Startup", StartupSchema);

export default Startup;
