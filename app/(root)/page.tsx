import StartupCard, { StartupTypeCard } from "@/app/components/StartupCard";
import SearchForm from "@/app/components/SearchForm";
import connectDB from "@/lib/mongodb";
import Startup from "@/models/Startup";

async function getStartups(search?: string) {
  try {
    await connectDB();

    // Ensure the User model is registered for populate
    await import("@/models/User");

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

    return startups.map((startup) => ({
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
  } catch (error) {
    console.error("Error fetching startups:", error);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const query = (await searchParams).query;
  const posts = await getStartups(query || undefined);

  return (
    <>
      <section className="pink_container">
        <h1 className="heading">
          Pitch Your Startup,
          <br />
          Connect with Entrepreneurs
        </h1>
        <p className="sub-heading !max-w-3xl">
          Submit Ideas, Vote on Pitches, and Get Noticed in Virtual Competitions
        </p>
        <SearchForm query={query} />
      </section>

      <section className="section_container max-w-6xl">
        <p className="text-30-semibold">
          {query ? `Search Result for "${query}"` : `All Startups`}
        </p>

        <ul className="card_grid mt-7">
          {posts && posts.length > 0 ? (
            posts.map((post: any) => <StartupCard key={post._id} post={post} />)
          ) : (
            <p className="no-results">No Startup Found</p>
          )}
        </ul>
      </section>
    </>
  );
}
