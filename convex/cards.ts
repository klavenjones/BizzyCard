import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Validates an email address format.
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a phone number format.
 * Supports international formats with optional country codes.
 */
function isValidPhone(phoneNumber: string): boolean {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return false;
  }
  const cleaned = phoneNumber.replace(/[\s\-\(\)\+]/g, "");
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Generate a unique share ID for a card.
 * Uses a combination of timestamp and random characters for uniqueness.
 */
function generateShareId(): string {
  // Generate a unique share ID using timestamp and random characters
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Get the current user's digital card.
 */
export const getCurrentUserCard = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkUserId = identity.subject;

    // Find the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      return null;
    }

    // Find the card for this user
    const card = await ctx.db
      .query("cards")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    return card ?? null;
  },
});

/**
 * Create a new digital card for the current user (during onboarding).
 */
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    title: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    bio: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
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

    // Check if user already has a card
    const existingCard = await ctx.db
      .query("cards")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (existingCard) {
      throw new Error("User already has a card");
    }

    // Validate required fields
    if (!args.name || args.name.trim().length === 0) {
      throw new Error("Name is required");
    }

    if (!args.email || !isValidEmail(args.email)) {
      throw new Error("Valid email is required");
    }

    // Validate phone number if provided
    if (args.phoneNumber && !isValidPhone(args.phoneNumber)) {
      throw new Error("Invalid phone number format");
    }

    const now = Date.now();
    const shareId = generateShareId();

    // Ensure shareId is unique (retry if collision, though unlikely)
    let uniqueShareId = shareId;
    let attempts = 0;
    while (attempts < 5) {
      const existing = await ctx.db
        .query("cards")
        .withIndex("by_shareId", (q) => q.eq("shareId", uniqueShareId))
        .first();

      if (!existing) {
        break;
      }
      uniqueShareId = generateShareId();
      attempts++;
    }

    // Create the card
    const cardId = await ctx.db.insert("cards", {
      userId: user._id,
      shareId: uniqueShareId,
      name: args.name.trim(),
      email: args.email.trim().toLowerCase(),
      title: args.title?.trim(),
      phoneNumber: args.phoneNumber?.trim(),
      company: args.company?.trim(),
      role: args.role?.trim(),
      bio: args.bio?.trim(),
      tags: args.tags || [],
      createdAt: now,
      updatedAt: now,
    });

    // Update user's onboardingCompleted status (T045)
    // Card is created with name + email (minimum required), so onboarding is complete
    if (!user.onboardingCompleted) {
      await ctx.db.patch(user._id, {
        onboardingCompleted: true,
        updatedAt: now,
      });
    }

    return await ctx.db.get(cardId);
  },
});

/**
 * Update the current user's digital card.
 */
export const update = mutation({
  args: {
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    bio: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
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

    // Build update object
    const updates: {
      name?: string;
      title?: string;
      email?: string;
      phoneNumber?: string;
      company?: string;
      role?: string;
      bio?: string;
      tags?: string[];
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    // Validate and set fields if provided
    if (args.name !== undefined) {
      if (!args.name || args.name.trim().length === 0) {
        throw new Error("Name cannot be empty");
      }
      updates.name = args.name.trim();
    }

    if (args.email !== undefined) {
      if (!isValidEmail(args.email)) {
        throw new Error("Invalid email format");
      }
      updates.email = args.email.trim().toLowerCase();
    }

    if (args.phoneNumber !== undefined) {
      if (args.phoneNumber && !isValidPhone(args.phoneNumber)) {
        throw new Error("Invalid phone number format");
      }
      updates.phoneNumber = args.phoneNumber?.trim() || undefined;
    }

    if (args.title !== undefined) {
      updates.title = args.title?.trim() || undefined;
    }

    if (args.company !== undefined) {
      updates.company = args.company?.trim() || undefined;
    }

    if (args.role !== undefined) {
      updates.role = args.role?.trim() || undefined;
    }

    if (args.bio !== undefined) {
      updates.bio = args.bio?.trim() || undefined;
    }

    if (args.tags !== undefined) {
      updates.tags = args.tags;
    }

    // Update the card
    await ctx.db.patch(card._id, updates);

    return await ctx.db.get(card._id);
  },
});

/**
 * Update the profile photo for the current user's card.
 */
export const updateProfilePhoto = mutation({
  args: {
    fileId: v.id("_storage"),
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

    // Verify file exists
    const file = await ctx.storage.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Update the card with new profile photo
    await ctx.db.patch(card._id, {
      profilePhotoId: args.fileId,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(card._id);
  },
});

/**
 * Update the resume file for the current user's card.
 */
export const updateResume = mutation({
  args: {
    fileId: v.id("_storage"),
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

    // Verify file exists
    const file = await ctx.storage.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check file size (10MB limit)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      throw new Error("File size exceeds 10MB limit");
    }

    // Update the card with new resume
    await ctx.db.patch(card._id, {
      resumeFileId: args.fileId,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(card._id);
  },
});

/**
 * Remove the profile photo from the current user's card.
 */
export const removeProfilePhoto = mutation({
  args: {},
  handler: async (ctx) => {
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

    // Remove profile photo
    await ctx.db.patch(card._id, {
      profilePhotoId: undefined,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(card._id);
  },
});

/**
 * Remove the resume file from the current user's card.
 */
export const removeResume = mutation({
  args: {},
  handler: async (ctx) => {
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

    // Remove resume
    await ctx.db.patch(card._id, {
      resumeFileId: undefined,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(card._id);
  },
});

/**
 * Regenerate the share link ID for the current user's card.
 * This allows users to revoke old share links and create new ones.
 */
export const regenerateShareId = mutation({
  args: {},
  handler: async (ctx) => {
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

    // Generate a new unique share ID
    let newShareId = generateShareId();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await ctx.db
        .query("cards")
        .withIndex("by_shareId", (q) => q.eq("shareId", newShareId))
        .first();

      if (!existing) {
        break;
      }
      newShareId = generateShareId();
      attempts++;
    }

    // Update the card with new share ID
    await ctx.db.patch(card._id, {
      shareId: newShareId,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(card._id);
  },
});

/**
 * Get a card by share ID (for public web views).
 * This query does not require authentication.
 */
export const getByShareId = query({
  args: {
    shareId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the card by share ID
    const card = await ctx.db
      .query("cards")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .first();

    return card ?? null;
  },
});

