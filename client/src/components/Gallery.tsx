import { useState } from "react";
import { Meme } from "@shared/schema";
import { cn } from "@/lib/utils";

interface GalleryProps {
  memes: Meme[];
  isLoading: boolean;
}

type FilterType = "all" | "most-voted" | "recent" | "battles-won";

const Gallery = ({ memes, isLoading }: GalleryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredMemes = memes.filter(meme => 
    meme.promptText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply sorting based on filter
  const sortedMemes = [...filteredMemes].sort((a, b) => {
    switch(filter) {
      case "most-voted":
        return b.likes - a.likes;
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "battles-won":
        return b.rank - a.rank;
      default:
        return b.likes - a.likes;
    }
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-xl font-poppins font-medium mb-3 md:mb-0">Generated Memes</h3>
        <div className="flex flex-col sm:flex-row w-full md:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative flex-grow sm:flex-grow-0">
            <input
              type="text"
              placeholder="Search your memes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
          >
            <option value="all">All memes</option>
            <option value="most-voted">Most voted</option>
            <option value="recent">Recent</option>
            <option value="battles-won">Battles won</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Loading gallery...</div>
      ) : sortedMemes.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          {searchQuery ? "No memes match your search query." : "No memes in your gallery yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedMemes.map((meme) => (
            <GalleryItem key={meme.id} meme={meme} />
          ))}
        </div>
      )}

      {sortedMemes.length > 0 && (
        <div className="flex justify-center mt-8">
          <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium">
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

interface GalleryItemProps {
  meme: Meme;
}

const GalleryItem = ({ meme }: GalleryItemProps) => {
  return (
    <div className="meme-card bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition">
      <img
        src={meme.imageUrl}
        alt={meme.promptText}
        className="w-full h-48 object-cover"
      />
      <div className="p-3">
        <p className="font-medium text-sm mb-2 line-clamp-1">"{meme.promptText}"</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <span className="flex items-center mr-2"><i className="ri-heart-line mr-1"></i> {meme.likes}</span>
            <span className="flex items-center"><i className="ri-eye-line mr-1"></i> {meme.views}</span>
          </div>
          <div className="flex space-x-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
              <i className="ri-share-line text-sm"></i>
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
              <i className="ri-edit-line text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
