import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    sortBy: v.optional(v.union(v.literal("recent"), v.literal("rating"), v.literal("votes"))),
  },
  handler: async (ctx, args) => {
    let portfolios;
    
    if (args.category) {
      portfolios = await ctx.db
        .query("portfolios")
        .withIndex("by_category", (q) => q.eq("category", args.category as string))
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect();
    } else {
      portfolios = await ctx.db
        .query("portfolios")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect();
    }

    // Sort portfolios
    if (args.sortBy === "rating") {
      portfolios.sort((a, b) => b.averageRating - a.averageRating);
    } else if (args.sortBy === "votes") {
      portfolios.sort((a, b) => b.totalVotes - a.totalVotes);
    } else {
      portfolios.sort((a, b) => b._creationTime - a._creationTime);
    }

    // Get thumbnail URLs
    return Promise.all(
      portfolios.map(async (portfolio) => ({
        ...portfolio,
        thumbnailUrl: portfolio.thumbnailId ? await ctx.storage.getUrl(portfolio.thumbnailId) : null,
      }))
    );
  },
});

export const get = query({
  args: { id: v.id("portfolios") },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db.get(args.id);
    if (!portfolio) return null;

    const fileUrls = await Promise.all(
      portfolio.fileIds.map(async (fileId) => ({
        id: fileId,
        url: await ctx.storage.getUrl(fileId),
      }))
    );

    return {
      ...portfolio,
      thumbnailUrl: portfolio.thumbnailId ? await ctx.storage.getUrl(portfolio.thumbnailId) : null,
      files: fileUrls,
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    thumbnailId: v.optional(v.id("_storage")),
    fileIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("portfolios", {
      title: args.title,
      description: args.description,
      authorId: userId,
      authorName: user.name || "Anonymous",
      authorEmail: user.email || "",
      category: args.category,
      tags: args.tags,
      thumbnailId: args.thumbnailId,
      fileIds: args.fileIds,
      averageRating: 0,
      totalVotes: 0,
      status: "published",
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});

export const myPortfolios = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const portfolios = await ctx.db
      .query("portfolios")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();

    return Promise.all(
      portfolios.map(async (portfolio) => ({
        ...portfolio,
        thumbnailUrl: portfolio.thumbnailId ? await ctx.storage.getUrl(portfolio.thumbnailId) : null,
      }))
    );
  },
});
