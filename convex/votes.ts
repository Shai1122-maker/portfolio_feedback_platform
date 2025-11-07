import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();

    const upvotes = votes.filter(v => v.type === "upvote").length;
    const downvotes = votes.filter(v => v.type === "downvote").length;
    
    let userVote = null;
    if (userId) {
      const existingVote = votes.find(v => v.userId === userId);
      userVote = existingVote?.type || null;
    }

    return {
      upvotes,
      downvotes,
      total: upvotes - downvotes,
      userVote,
    };
  },
});

export const toggle = mutation({
  args: {
    portfolioId: v.id("portfolios"),
    type: v.union(v.literal("upvote"), v.literal("downvote")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check for existing vote
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_user_portfolio", (q) => q.eq("userId", userId).eq("portfolioId", args.portfolioId))
      .unique();

    if (existingVote) {
      if (existingVote.type === args.type) {
        // Remove vote if clicking the same type
        await ctx.db.delete(existingVote._id);
      } else {
        // Change vote type
        await ctx.db.patch(existingVote._id, { type: args.type });
      }
    } else {
      // Create new vote
      await ctx.db.insert("votes", {
        portfolioId: args.portfolioId,
        userId,
        type: args.type,
      });
    }

    // Update portfolio total votes
    await updatePortfolioVotes(ctx, args.portfolioId);
  },
});

async function updatePortfolioVotes(ctx: any, portfolioId: string) {
  const votes = await ctx.db
    .query("votes")
    .withIndex("by_portfolio", (q: any) => q.eq("portfolioId", portfolioId))
    .collect();

  const upvotes = votes.filter((v: any) => v.type === "upvote").length;
  const downvotes = votes.filter((v: any) => v.type === "downvote").length;
  const totalVotes = upvotes - downvotes;

  await ctx.db.patch(portfolioId, { totalVotes });
}
