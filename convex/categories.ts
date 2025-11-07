import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const seed = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) return;

    const defaultCategories = [
      { name: "Web Design", description: "Website and web application designs", color: "#3B82F6" },
      { name: "Mobile App", description: "Mobile application interfaces", color: "#10B981" },
      { name: "Graphic Design", description: "Logos, branding, and visual identity", color: "#F59E0B" },
      { name: "UI/UX", description: "User interface and experience design", color: "#8B5CF6" },
      { name: "Photography", description: "Photo portfolios and visual storytelling", color: "#EF4444" },
      { name: "Illustration", description: "Digital and traditional illustrations", color: "#EC4899" },
      { name: "3D Design", description: "3D modeling and visualization", color: "#06B6D4" },
      { name: "Other", description: "Other creative work", color: "#6B7280" },
    ];

    for (const category of defaultCategories) {
      await ctx.db.insert("categories", category);
    }
  },
});
