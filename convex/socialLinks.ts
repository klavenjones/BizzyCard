import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Valid platform types for social links.
 */
const VALID_PLATFORMS = [
  "linkedin",
  "github",
  "twitter",
  "bluesky",
  "facebook",
  "instagram",
  "portfolio",
  "custom",
] as const;

type Platform = (typeof VALID_PLATFORMS)[number];

/**
 * Validates a URL format.
 */
function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates that a platform is one of the allowed values.
 */
function isValidPlatform(platform: string): platform is Platform {
  return VALID_PLATFORMS.includes(platform as Platform);
}

/**
 * Get all social links for a card.
 */
export const getByCardId = query({
  args: {
    cardId: v.id("cards"),
  },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("socialLinks")
      .withIndex("by_cardId", (q) => q.eq("cardId", args.cardId))
      .collect();

    // Sort by order field
    return links.sort((a, b) => a.order - b.order);
  },
});

/**
 * Add a social link to the current user's card.
 */
export const add = mutation({
  args: {
    platform: v.string(),
    url: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkUserId = identity.subject;

    // Find the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Find the card for this user
    const card = await ctx.db
      .query("cards")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!card) {
      throw new Error("Card not found");
    }

    // Validate platform
    if (!isValidPlatform(args.platform)) {
      throw new Error(
        `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(", ")}`
      );
    }

    // Validate URL
    if (!isValidUrl(args.url)) {
      throw new Error("Invalid URL format");
    }

    // Check for duplicate platform on same card
    const existingLink = await ctx.db
      .query("socialLinks")
      .withIndex("by_cardId_platform", (q) =>
        q.eq("cardId", card._id).eq("platform", args.platform)
      )
      .first();

    if (existingLink) {
      throw new Error(
        `A ${args.platform} link already exists for this card. Use update instead.`
      );
    }

    // Determine order - if not provided, use next available order
    let order = args.order;
    if (order === undefined) {
      const existingLinks = await ctx.db
        .query("socialLinks")
        .withIndex("by_cardId", (q) => q.eq("cardId", card._id))
        .collect();

      order = existingLinks.length > 0 ? Math.max(...existingLinks.map((l) => l.order)) + 1 : 0;
    }

    // Create the social link
    const linkId = await ctx.db.insert("socialLinks", {
      cardId: card._id,
      platform: args.platform,
      url: args.url.trim(),
      order,
      createdAt: Date.now(),
    });

    return await ctx.db.get(linkId);
  },
});

/**
 * Update a social link.
 */
export const update = mutation({
  args: {
    linkId: v.id("socialLinks"),
    url: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkUserId = identity.subject;

    // Find the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Find the card for this user
    const card = await ctx.db
      .query("cards")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!card) {
      throw new Error("Card not found");
    }

    // Find the link
    const link = await ctx.db.get(args.linkId);
    if (!link) {
      throw new Error("Link not found");
    }

    // Verify link belongs to user's card
    if (link.cardId !== card._id) {
      throw new Error("Link does not belong to your card");
    }

    // Build update object
    const updates: {
      url?: string;
      order?: number;
    } = {};

    // Validate and set URL if provided
    if (args.url !== undefined) {
      if (!isValidUrl(args.url)) {
        throw new Error("Invalid URL format");
      }
      updates.url = args.url.trim();
    }

    // Set order if provided
    if (args.order !== undefined) {
      updates.order = args.order;
    }

    // Update the link
    await ctx.db.patch(args.linkId, updates);

    return await ctx.db.get(args.linkId);
  },
});

/**
 * Remove a social link.
 */
export const remove = mutation({
  args: {
    linkId: v.id("socialLinks"),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkUserId = identity.subject;

    // Find the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Find the card for this user
    const card = await ctx.db
      .query("cards")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!card) {
      throw new Error("Card not found");
    }

    // Find the link
    const link = await ctx.db.get(args.linkId);
    if (!link) {
      throw new Error("Link not found");
    }

    // Verify link belongs to user's card
    if (link.cardId !== card._id) {
      throw new Error("Link does not belong to your card");
    }

    // Delete the link
    await ctx.db.delete(args.linkId);

    return { success: true };
  },
});

