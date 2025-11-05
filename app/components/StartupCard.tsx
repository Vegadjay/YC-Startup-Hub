import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React from "react";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export type Author = {
  _id: string;
  name?: string;
  username?: string;
  bio?: string;
  profilePicture?: string;
};

export type StartupTypeCard = {
  _id: string;
  title?: string;
  slug?: {
    _type: string;
    current?: string;
  };
  _createdAt: string;
  author?: Author;
  views?: number;
  description?: string;
  category?: string;
  image?: string;
  pitch?: string;
};

const StartupCard = ({ post }: { post: StartupTypeCard }) => {
  const {
    _createdAt,
    views,
    author,
    title,
    _id,
    category,
    image,
    description,
  } = post;
  const authorName = author?.name || "Unknown Author";
  const authorProfilePic = author?.profilePicture || "/default-profile-pic.jpg";
  const imageUrl = image || "/placeholder-image.jpg";

  return (
    <>
      <li className="startup-card group">
        <div className="flex-between">
          <p className="startup_card_date">{formatDate(_createdAt)}</p>
          <div className="flex gap-1.5">
            <EyeIcon className="size-6 text-primary" />
            <span className="text-16-medium">{views}</span>
          </div>
        </div>

        <div className="flex-between">
          <div className="flex-1">
            <Link href={`/user/${author?._id}`}>
              <p className="text-16-medium line-clamp-1">{authorName}</p>
            </Link>
            <Link href={`/startup/${_id}`}>
              <h3 className="text-16-medium line-clamp-1">{title}</h3>
            </Link>
          </div>
          <Link href={`/user/${author?._id}`}>
            <Image
              src={authorProfilePic}
              height={48}
              width={48}
              alt="Profile Picture"
              className="rounded-full object-cover"
              unoptimized={true}
            />
          </Link>
        </div>

        <div className="mt-3">
          <p className="text-14 line-clamp-2">
            {description || "No description available."}
          </p>
        </div>

        <div className="mt-5">
          <Link href={`/startup/${_id}`}>
            <img src={imageUrl} className="rounded-xl " alt="Startup" />
          </Link>
        </div>

        <div className="flex-between gap-3 mt-5">
          <Link href={`/?query=${category?.toLowerCase()}`}>
            <p className="text-16-medium">{category}</p>
          </Link>

          <Button className="startup-card_btn" asChild>
            <Link href={`/startup/${_id}`}>Details</Link>
          </Button>
        </div>
      </li>
    </>
  );
};

export default StartupCard;
