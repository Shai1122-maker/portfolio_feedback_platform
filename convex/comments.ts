import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .order("desc")
      .collect();

    return comments;
  },
});

export const create = mutation({
  args: {
    portfolioId: v.id("portfolios"),
    content: v.string(),
    rating: v.number(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Create the comment
    const commentId = await ctx.db.insert("comments", {
      portfolioId: args.portfolioId,
      authorId: userId,
      authorName: user.name || "Anonymous",
      content: args.content,
      rating: args.rating,
      category: args.category,
    });

    // Update portfolio average rating
    await updatePortfolioRating(ctx, args.portfolioId);

    return commentId;
  },
});

async function updatePortfolioRating(ctx: any, portfolioId: string) {
  const comments = await ctx.db
    .query("comments")
    .withIndex("by_portfolio", (q: any) => q.eq("portfolioId", portfolioId))
    .collect();

  if (comments.length === 0) return;

  const totalRating = comments.reduce((sum: number, comment: any) => sum + comment.rating, 0);
  const averageRating = totalRating / comments.length;

  await ctx.db.patch(portfolioId, {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
  });
}

export const getStats = query({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();

    const categoryStats = comments.reduce((acc, comment) => {
      if (!acc[comment.category]) {
        acc[comment.category] = { total: 0, count: 0 };
      }
      acc[comment.category].total += comment.rating;
      acc[comment.category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const categoryAverages = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      average: Math.round((stats.total / stats.count) * 10) / 10,
      count: stats.count,
    }));

    return {
      totalComments: comments.length,
      categoryAverages,
      overallRating: comments.length > 0 
        ? Math.round((comments.reduce((sum, c) => sum + c.rating, 0) / comments.length) * 10) / 10
        : 0,
    };
  },
});
