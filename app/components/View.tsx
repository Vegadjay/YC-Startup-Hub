import Ping from "@/app/components/Ping";
import connectDB from "@/lib/mongodb";
import Startup from "@/models/Startup";

async function getViews(id: string) {
  try {
    await connectDB();
    const startup = await Startup.findById(id).select("views").lean();
    return startup?.views || 0;
  } catch (error) {
    console.error("Error fetching views:", error);
    return 0;
  }
}

async function incrementViews(id: string) {
  try {
    await connectDB();
    const startup = await Startup.findById(id);
    if (startup) {
      startup.views = (startup.views || 0) + 1;
      await startup.save();
    }
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
}

const View = async ({ id }: { id: string }) => {
  const totalViews = await getViews(id);

  // Increment views asynchronously
  incrementViews(id);

  return (
    <div className="view-container">
      <div className="absolute -top-2 -right-2">
        <Ping />
      </div>

      <p className="view-text">
        <span className="font-black">Views: {totalViews}</span>
      </p>
    </div>
  );
};

export default View;
