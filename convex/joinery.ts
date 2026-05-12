import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createQuote = mutation({
  args: {
    userId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    userRole: v.union(
      v.literal("guest"),
      v.literal("client"),
      v.literal("dealer"),
      v.literal("supplier"),
      v.literal("admin")
    ),
    dealerId: v.optional(v.string()),
    supplierId: v.optional(v.string()),
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
  args: {
    userId: v.optional(v.string()),
    dealerId: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.dealerId) {
      return await ctx.db
        .query("quotes")
        .withIndex("by_dealer", (q) => q.eq("dealerId", args.dealerId!))
        .collect();
    }
    if (args.userId) {
      return await ctx.db
        .query("quotes")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    }
    if (args.status) {
      return await ctx.db
        .query("quotes")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "sent" | "confirmed" | "converted"))
        .collect();
    }
    return await ctx.db.query("quotes").collect();
  },
});

export const updateQuoteStatus = mutation({
  args: {
    quoteId: v.id("quotes"),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("confirmed"),
      v.literal("converted")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.quoteId, { status: args.status });
    return { success: true };
  },
});

export const getProducts = query({
  args: {
    type: v.optional(v.union(
      v.literal("window_1_canat"),
      v.literal("window_2_canate"),
      v.literal("window_3_canate"),
      v.literal("window_fix"),
      v.literal("window_1_2_3"),
      v.literal("window_cu_lista"),
      v.literal("usa_balcon_1"),
      v.literal("usa_balcon_2"),
      v.literal("usa_intrare_pvc"),
      v.literal("usa_intrare_aluminiu"),
      v.literal("pervaz_fereastra"),
      v.literal("pervaz_usa")
    )),
    profileSeries: v.optional(v.union(
      v.literal("ecoline_58"),
      v.literal("ecoline_70"),
      v.literal("ecoline_76"),
      v.literal("premium_70"),
      v.literal("premium_82"),
      v.literal("prestige_76"),
      v.literal("prestige_85"),
      v.literal("prestige_92"),
      v.literal("alu_premium_75"),
      v.literal("alu_smart_80")
    )),
  },
  handler: async (ctx, args) => {
    if (args.type !== undefined) {
      return await ctx.db
        .query("products")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    }
    if (args.profileSeries !== undefined) {
      return await ctx.db
        .query("products")
        .withIndex("by_profile", (q) => q.eq("profileSeries", args.profileSeries!))
        .collect();
    }
    return await ctx.db.query("products").collect();
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("window_1_canat"),
      v.literal("window_2_canate"),
      v.literal("window_3_canate"),
      v.literal("window_fix"),
      v.literal("window_1_2_3"),
      v.literal("window_cu_lista"),
      v.literal("usa_balcon_1"),
      v.literal("usa_balcon_2"),
      v.literal("usa_intrare_pvc"),
      v.literal("usa_intrare_aluminiu"),
      v.literal("pervaz_fereastra"),
      v.literal("pervaz_usa")
    ),
    profileSeries: v.union(
      v.literal("ecoline_58"),
      v.literal("ecoline_70"),
      v.literal("ecoline_76"),
      v.literal("premium_70"),
      v.literal("premium_82"),
      v.literal("prestige_76"),
      v.literal("prestige_85"),
      v.literal("prestige_92"),
      v.literal("alu_premium_75"),
      v.literal("alu_smart_80")
    ),
    basePricePerSqm: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("products", args);
    return id;
  },
});

export const updateProductPrice = mutation({
  args: {
    productId: v.id("products"),
    basePricePerSqm: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, { basePricePerSqm: args.basePricePerSqm });
    return { success: true };
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
      await ctx.db.patch(existing._id, args);
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

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const createOrder = mutation({
  args: {
    quoteId: v.optional(v.id("quotes")),
    clientId: v.optional(v.string()),
    clientName: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    dealerId: v.optional(v.string()),
    supplierId: v.optional(v.string()),
    productType: v.string(),
    width: v.number(),
    height: v.number(),
    profileSeries: v.string(),
    interiorColor: v.string(),
    exteriorColor: v.string(),
    glassType: v.string(),
    hardwareBrand: v.string(),
    hardwareLevel: v.string(),
    accessories: v.array(v.string()),
    price: v.object({
      profile: v.number(),
      glass: v.number(),
      hardware: v.number(),
      accessories: v.number(),
      transport: v.number(),
      montaj: v.number(),
      subtotal: v.number(),
      discount: v.number(),
      tva: v.number(),
      total: v.number(),
    }),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      ...args,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (args.dealerId && args.quoteId) {
      const dealer = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "dealer"))
        .collect()
        .then((dealers) => dealers.find((d) => d.clerkId === args.dealerId));

      if (dealer) {
        await ctx.db.insert("commissions", {
          dealerId: args.dealerId,
          dealerName: dealer.company || dealer.name || "Unknown",
          quoteId: args.quoteId,
          orderTotal: args.price.total,
          commissionPercent: dealer.discountRate,
          commissionAmount: Math.round(args.price.total * dealer.discountRate / 100),
          status: "pending",
          createdAt: Date.now(),
        });
      }
    }

    return orderId;
  },
});

export const listOrders = query({
  args: {
    dealerId: v.optional(v.string()),
    clientId: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.dealerId) {
      return await ctx.db
        .query("orders")
        .withIndex("by_dealer", (q) => q.eq("dealerId", args.dealerId!))
        .collect();
    }
    if (args.clientId) {
      return await ctx.db
        .query("orders")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId!))
        .collect();
    }
    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status as "draft" | "quoted" | "confirmed" | "production" | "completed" | "cancelled"))
        .collect();
    }
    return await ctx.db.query("orders").collect();
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("draft"),
      v.literal("quoted"),
      v.literal("confirmed"),
      v.literal("production"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const listCommissions = query({
  args: {
    dealerId: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.dealerId) {
      return await ctx.db
        .query("commissions")
        .withIndex("by_dealer", (q) => q.eq("dealerId", args.dealerId!))
        .collect();
    }
    if (args.status) {
      return await ctx.db
        .query("commissions")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "approved" | "paid" | "rejected"))
        .collect();
    }
    return await ctx.db.query("commissions").collect();
  },
});

export const updateCommissionStatus = mutation({
  args: {
    commissionId: v.id("commissions"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("paid"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const update: Record<string, unknown> = { status: args.status };
    if (args.status === "paid") {
      update.paidAt = Date.now();
    }
    await ctx.db.patch(args.commissionId, update);
    return { success: true };
  },
});