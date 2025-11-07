import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { StarIcon, ChevronUpIcon, ChevronDownIcon } from "./Icons";

interface PortfolioListProps {
  onViewPortfolio: (id: string) => void;
}

export function PortfolioList({ onViewPortfolio }: PortfolioListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recent" | "rating" | "votes">("recent");
  
  const categories = useQuery(api.categories.list) || [];
  const portfolios = useQuery(api.portfolios.list, { 
    category: selectedCategory || undefined,
    sortBy 
  }) || [];
  
  const seedCategories = useMutation(api.categories.seed);

  useEffect(() => {
    if (categories.length === 0) {
      seedCategories();
    }
  }, [categories.length, seedCategories]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Browse Portfolios</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "rating" | "votes")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="rating">Highest Rated</option>
            <option value="votes">Most Voted</option>
          </select>
        </div>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No portfolios found. Be the first to share your work!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio._id}
              portfolio={portfolio}
              onView={() => onViewPortfolio(portfolio._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PortfolioCard({ portfolio, onView }: { portfolio: any; onView: () => void }) {
  const votes = useQuery(api.votes.get, { portfolioId: portfolio._id });

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="aspect-video bg-gray-200 relative overflow-hidden">
        {portfolio.thumbnailUrl ? (
          <img
            src={portfolio.thumbnailUrl}
            alt={portfolio.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>No preview</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
          {portfolio.category}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {portfolio.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {portfolio.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">
              {portfolio.averageRating > 0 ? portfolio.averageRating.toFixed(1) : "No ratings"}
            </span>
          </div>
          
          {votes && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <ChevronUpIcon className="w-4 h-4 text-green-600" />
                <span>{votes.upvotes}</span>
              </div>
              <div className="flex items-center gap-1">
                <ChevronDownIcon className="w-4 h-4 text-red-600" />
                <span>{votes.downvotes}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            by {portfolio.authorName}
          </div>
          <button
            onClick={onView}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>
        
        {portfolio.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {portfolio.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {portfolio.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{portfolio.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
