import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createQuote = mutation({
  args: {
    userId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    userRole: v.union(
      v.literal("guest"),
      v.literal("client"),
      v.literal("dealer")
    ),
    productType: v.string(),
    width: v.number(),
    height: v.number(),
    profileSeries: v.string(),
    color: v.string(),
    glassType: v.string(),
    price: v.object({
      profile: v.number(),
      glass: v.number(),
      hardware: v.number(),
      subtotal: v.number(),
      discount: v.number(),
      total: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const quoteId = await ctx.db.insert("quotes", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    return quoteId;
  },
});

export const getQuote = query({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listQuotes = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("quotes")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    }
    return await ctx.db.query("quotes").collect();
  },
});

export const getProducts = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("products")
        .withIndex("by_type", (q) => q.eq("type", args.type))
        .collect();
    }
    return await ctx.db.query("products").collect();
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    profileSeries: v.string(),
    basePricePerSqm: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("products", args);
    return id;
  },
});

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(
      v.literal("client"),
      v.literal("dealer"),
      v.literal("admin")
    ),
    discountRate: v.number(),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      const id = await ctx.db.insert("users", {
        ...args,
        createdAt: Date.now(),
      });
      return id;
    }
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});