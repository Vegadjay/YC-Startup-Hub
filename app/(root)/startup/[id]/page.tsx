import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import markdownit from "markdown-it";
import { Skeleton } from "@/components/ui/skeleton";
import View from "@/app/components/View";
import connectDB from "@/lib/mongodb";
import Startup from "@/models/Startup";

const md = markdownit();

async function getStartup(id: string) {
  try {
    await connectDB();

    const startup = await Startup.findById(id)
      .populate("author", "_id name username bio profilePicture")
      .lean();

    if (!startup) {
      return null;
    }

    return {
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
  } catch (error) {
    console.error("Error fetching startup:", error);
    return null;
  }
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const post = await getStartup(id);

  const parsedContent = md.render(post?.pitch || "");

  if (!post) {
    return notFound();
  }

  return (
    <div>
      <section className="pink_container !min-h-[230px]">
        <p className="tag">{formatDate(post._createdAt)}</p>
        <h1 className="heading">{post.title}</h1>
        <p className="sub-heading !max-w-5xl">{post.description}</p>
      </section>

      <section className="section_container">
        <img
          src={
            post.image ??
            "https://cdn.vectorstock.com/i/1000x1000/47/39/simple-person-icon-or-user-and-avatar-vector-46414739.webp"
          }
          alt="thumbnail"
          className="rounded-xl h-full w-[890px] mx-auto"
        />

        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5">
            <Link
              href={`/user/${post.author?._id}`}
              className="flex gap-2 items-center mb-3"
            >
              <img
                src={
                  post.author?.profilePicture ??
                  "https://www.teradrinks.com/wp-content/uploads/2013/09/1000x500.gif"
                }
                alt="avatar"
                width={64}
                height={64}
                className="rounded-full drop-shadow-lg"
              />
              <div>
                <p className="text-20-medium">{post.author?.name}</p>
                <p className="text-16-medium !text-black-300">
                  {post.author?.username}
                </p>
              </div>
            </Link>

            <p className="category-tag">{post.category}</p>
          </div>

          <h3 className="text-30-bold">Pitch Details</h3>

          {parsedContent ? (
            <article
              dangerouslySetInnerHTML={{ __html: parsedContent }}
              className="prose max-w-4xl font-work-sans breaka-all"
            />
          ) : (
            <p className="no-result">No Details Provided</p>
          )}
        </div>
        <hr className="divider" />
        <Suspense fallback={<Skeleton className="view_skeleton" />}>
          <View id={id} />
        </Suspense>
      </section>
    </div>
  );
};

export default Page;
