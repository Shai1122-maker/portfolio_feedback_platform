import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  portfolios: defineTable({
    title: v.string(),
    description: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    authorEmail: v.string(),
    thumbnailId: v.optional(v.id("_storage")),
    fileIds: v.array(v.id("_storage")),
    category: v.string(),
    tags: v.array(v.string()),
    averageRating: v.number(),
    totalVotes: v.number(),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
  })
    .index("by_author", ["authorId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_rating", ["averageRating"]),

  comments: defineTable({
    portfolioId: v.id("portfolios"),
    authorId: v.id("users"),
    authorName: v.string(),
    content: v.string(),
    rating: v.number(), // 1-5 stars
    category: v.string(), // "design", "usability", "content", "technical", "overall"
  })
    .index("by_portfolio", ["portfolioId"])
    .index("by_author", ["authorId"]),

  votes: defineTable({
    portfolioId: v.id("portfolios"),
    userId: v.id("users"),
    type: v.union(v.literal("upvote"), v.literal("downvote")),
  })
    .index("by_portfolio", ["portfolioId"])
    .index("by_user_portfolio", ["userId", "portfolioId"]),

  categories: defineTable({
    name: v.string(),
    description: v.string(),
    color: v.string(),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
