import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StarIcon } from "./Icons";

interface MyPortfoliosProps {
  onViewPortfolio: (id: string) => void;
}

export function MyPortfolios({ onViewPortfolio }: MyPortfoliosProps) {
  const portfolios = useQuery(api.portfolios.myPortfolios) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">My Portfolios</h2>
      
      {portfolios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">You haven't uploaded any portfolios yet.</p>
          <p className="text-gray-400">Share your creative work to get feedback from the community!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <div key={portfolio._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
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
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                  portfolio.status === "published" 
                    ? "bg-green-100 text-green-700" 
                    : portfolio.status === "draft"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {portfolio.status}
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
                  <div className="text-sm text-gray-600">
                    {portfolio.totalVotes > 0 ? `+${portfolio.totalVotes}` : portfolio.totalVotes} votes
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {new Date(portfolio._creationTime).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => onViewPortfolio(portfolio._id)}
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
          ))}
        </div>
      )}
    </div>
  );
}
