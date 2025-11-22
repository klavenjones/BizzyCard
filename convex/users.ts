import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Sync user from Clerk authentication event.
 * Creates or updates user record when user authenticates.
 */
export const syncFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    const now = Date.now();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        phoneNumber: args.phoneNumber,
        updatedAt: now,
      });
      return await ctx.db.get(existingUser._id);
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkUserId: args.clerkUserId,
        email: args.email,
        phoneNumber: args.phoneNumber,
        createdAt: now,
        updatedAt: now,
        onboardingCompleted: false,
      });
      return await ctx.db.get(userId);
    }
  },
});

/**
 * Get the current authenticated user's profile.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // The identity.subject is the Clerk user ID
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    return user ?? null;
  },
});

/**
 * Look up a user by email address (for in-app sharing).
 */
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };
  },
});

/**
 * Look up a user by phone number (for in-app sharing).
 */
export const getByPhone = query({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_phoneNumber", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };
  },
});

