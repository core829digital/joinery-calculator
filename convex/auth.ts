import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const registerUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(
      v.literal("client"),
      v.literal("dealer"),
      v.literal("supplier"),
      v.literal("admin")
    ),
    discountRate: v.number(),
    company: v.optional(v.string()),
    supplierId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("users", {
        ...args,
        isActive: true,
        createdAt: Date.now(),
      });
      return id;
    }
  },
});

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const listUsersByRole = query({
  args: {
    role: v.union(
      v.literal("client"),
      v.literal("dealer"),
      v.literal("supplier"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

export const updateUserRole = mutation({
  args: {
    clerkId: v.string(),
    role: v.union(
      v.literal("client"),
      v.literal("dealer"),
      v.literal("supplier"),
      v.literal("admin")
    ),
    discountRate: v.optional(v.number()),
    supplierId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        role: args.role,
        discountRate: args.discountRate ?? user.discountRate,
        supplierId: args.supplierId,
      });
      return { success: true };
    }
    return { success: false, error: "User not found" };
  },
});

export const deactivateUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, { isActive: false });
      return { success: true };
    }
    return { success: false, error: "User not found" };
  },
});

export const generateDealerCode = mutation({
  args: {
    dealerId: v.string(),
    dealerName: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const code = `DLR${Date.now().toString(36).toUpperCase()}`;

    await ctx.db.insert("dealerCodes", {
      code,
      dealerId: args.dealerId,
      dealerName: args.dealerName,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      isActive: true,
      clientCodes: [],
    });

    return { code, dealerId: args.dealerId };
  },
});

export const verifyDealerCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const dealerCode = await ctx.db
      .query("dealerCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (dealerCode && dealerCode.isActive) {
      return { valid: true, dealerId: dealerCode.dealerId, dealerName: dealerCode.dealerName };
    }
    return { valid: false };
  },
});

export const getDealerById = query({
  args: { dealerId: v.string() },
  handler: async (ctx, args) => {
    const dealer = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "dealer"))
      .collect();

    return dealer.find((d) => d.clerkId === args.dealerId);
  },
});

export const listAllDealers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "dealer"))
      .collect();
  },
});

export const listAllSuppliers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "supplier"))
      .collect();
  },
});
