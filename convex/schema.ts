import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
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
  })
    .index("by_type", ["type"])
    .index("by_profile", ["profileSeries"]),

  quotes: defineTable({
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
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("confirmed"),
      v.literal("converted")
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_dealer", ["dealerId"])
    .index("by_status", ["status"]),

  users: defineTable({
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
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerk", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  dealerCodes: defineTable({
    code: v.string(),
    dealerId: v.string(),
    dealerName: v.string(),
    createdBy: v.string(),
    createdAt: v.number(),
    isActive: v.boolean(),
    clientCodes: v.array(v.string()),
  })
    .index("by_code", ["code"])
    .index("by_dealer", ["dealerId"]),

  commissions: defineTable({
    dealerId: v.string(),
    dealerName: v.string(),
    quoteId: v.id("quotes"),
    orderTotal: v.number(),
    commissionPercent: v.number(),
    commissionAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("paid"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
  })
    .index("by_dealer", ["dealerId"])
    .index("by_status", ["status"]),

  orders: defineTable({
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
    status: v.union(
      v.literal("draft"),
      v.literal("quoted"),
      v.literal("confirmed"),
      v.literal("production"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_dealer", ["dealerId"])
    .index("by_status", ["status"]),
});