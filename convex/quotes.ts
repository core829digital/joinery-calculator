import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendQuoteEmail = mutation({
  args: {
    quoteId: v.id("quotes"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }
    await ctx.db.patch(args.quoteId, { status: "sent" });
    return { success: true, email: args.email };
  },
});

export const convertQuote = mutation({
  args: { quoteId: v.id("quotes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.quoteId, { status: "converted" });
    return { success: true };
  },
});