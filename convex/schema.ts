import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("window_1_canat"),
      v.literal("window_2_canate"),
      v.literal("usa_balcon"),
      v.literal("usa_intrare")
    ),
    profileSeries: v.union(
      v.literal("ecoline_70"),
      v.literal("premium_82"),
      v.literal("prestige_92")
    ),
    basePricePerSqm: v.number(),
    isActive: v.boolean(),
  }).index("by_type", ["type"]),

  quotes: defineTable({
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
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("converted")
    ),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  users: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_clerk", ["clerkId"])
    .index("by_email", ["email"]),
});