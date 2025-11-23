import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Send a card to another app user (creates notification/pending request).
 * This mutation prepares the card for sharing but doesn't automatically add it to the recipient's contacts.
 * The recipient must accept the card using contacts.acceptCard.
 */
export const sendCard = mutation({
  args: {
    recipientUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkUserId = identity.subject;

    // Find the current user by Clerk ID
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Verify the recipient exists
    const recipient = await ctx.db.get(args.recipientUserId);
    if (!recipient) {
      throw new Error("Recipient not found");
    }

    // Prevent users from sending to themselves
    if (args.recipientUserId === currentUser._id) {
      throw new Error("Cannot send card to self");
    }

    // Verify the current user has a card
    const card = await ctx.db
      .query("cards")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .first();

    if (!card) {
      throw new Error("Current user does not have a card");
    }

    // TODO: In the future, this could create a notification or pending request
    // For now, we just return success. The actual sharing flow will be:
    // 1. User A shares card with User B (via QR scan or lookup)
    // 2. User B receives notification (to be implemented with notifications service)
    // 3. User B accepts card using contacts.acceptCard

    return {
      success: true,
      // notificationId will be added when notification system is implemented
    };
  },
});

