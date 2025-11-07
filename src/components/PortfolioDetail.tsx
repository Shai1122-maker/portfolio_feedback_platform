import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";
import { StarIcon, ChevronUpIcon, ChevronDownIcon, ArrowLeftIcon } from "./Icons";

interface PortfolioDetailProps {
  portfolioId: string;
  onBack: () => void;
}

export function PortfolioDetail({ portfolioId, onBack }: PortfolioDetailProps) {
  const portfolio = useQuery(api.portfolios.get, { id: portfolioId as Id<"portfolios"> });
  const comments = useQuery(api.comments.list, { portfolioId: portfolioId as Id<"portfolios"> });
  const votes = useQuery(api.votes.get, { portfolioId: portfolioId as Id<"portfolios"> });
  const stats = useQuery(api.comments.getStats, { portfolioId: portfolioId as Id<"portfolios"> });

  if (!portfolio) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Browse
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{portfolio.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{portfolio.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span>by {portfolio.authorName}</span>
              <span>•</span>
              <span>{portfolio.category}</span>
              <span>•</span>
              <span>{new Date(portfolio._creationTime).toLocaleDateString()}</span>
            </div>

            {portfolio.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {portfolio.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <PortfolioFiles files={portfolio.files} />
        </div>

        <div className="space-y-6">
          <PortfolioStats stats={stats} votes={votes} portfolioId={portfolioId} />
          <CommentSection portfolioId={portfolioId} comments={comments} />
        </div>
      </div>
    </div>
  );
}

function PortfolioFiles({ files }: { files: Array<{ id: string; url: string | null }> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Portfolio Files</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file, index) => (
          <div key={file.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {file.url ? (
              <div className="aspect-video bg-gray-100">
                <img
                  src={file.url}
                  alt={`Portfolio file ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p>File preview not available</p>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Download file
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <span className="text-gray-500">Loading...</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioStats({ stats, votes, portfolioId }: { 
  stats: any; 
  votes: any; 
  portfolioId: string; 
}) {
  const toggleVote = useMutation(api.votes.toggle);

  const handleVote = async (type: "upvote" | "downvote") => {
    try {
      await toggleVote({ portfolioId: portfolioId as Id<"portfolios">, type });
    } catch (error) {
      toast.error("Failed to vote. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Portfolio Stats</h3>
      
      {stats && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Overall Rating</span>
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">
                {stats.overallRating > 0 ? stats.overallRating.toFixed(1) : "No ratings"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Comments</span>
            <span className="font-medium">{stats.totalComments}</span>
          </div>

          {stats.categoryAverages.length > 0 && (
            <div className="space-y-2">
              <span className="text-gray-600 text-sm">Category Ratings</span>
              {stats.categoryAverages.map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{cat.category}</span>
                  <span>{cat.average.toFixed(1)} ({cat.count})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {votes && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Community Votes</span>
            <span className="font-medium">
              {votes.total > 0 ? `+${votes.total}` : votes.total}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleVote("upvote")}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                votes.userVote === "upvote"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600"
              }`}
            >
              <ChevronUpIcon className="w-4 h-4" />
              {votes.upvotes}
            </button>
            <button
              onClick={() => handleVote("downvote")}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                votes.userVote === "downvote"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
              }`}
            >
              <ChevronDownIcon className="w-4 h-4" />
              {votes.downvotes}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentSection({ portfolioId, comments }: { portfolioId: string; comments: any[] | undefined }) {
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState("overall");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createComment = useMutation(api.comments.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      await createComment({
        portfolioId: portfolioId as Id<"portfolios">,
        content: newComment.trim(),
        rating,
        category,
      });
      setNewComment("");
      setRating(5);
      setCategory("overall");
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: "overall", label: "Overall" },
    { value: "design", label: "Design" },
    { value: "usability", label: "Usability" },
    { value: "content", label: "Content" },
    { value: "technical", label: "Technical" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Feedback & Comments</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your thoughts and feedback..."
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Star{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Adding..." : "Add Feedback"}
        </button>
      </form>

      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{comment.authorName}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{comment.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{comment.rating}</span>
                </div>
              </div>
              <p className="text-gray-700">{comment.content}</p>
              <span className="text-xs text-gray-500">
                {new Date(comment._creationTime).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            No comments yet. Be the first to share your feedback!
          </p>
        )}
      </div>
    </div>
  );
}
