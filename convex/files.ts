import { v } from "convex/values";
import { query, action } from "./_generated/server";

/**
 * Generate an upload URL for file uploads.
 * Returns a URL that can be used to upload a file to Convex storage.
 */
export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a secure download URL for a file.
 * The URL is valid for a limited time (typically 1 hour).
 */
export const getUrl = query({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get the file from storage
    const file = await ctx.storage.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Generate a secure download URL
    // Convex storage.getUrl returns a URL that expires after a default time
    const url = await ctx.storage.getUrl(args.fileId);
    if (!url) {
      throw new Error("Failed to generate download URL");
    }

    // Calculate expiration time (typically 1 hour from now)
    // Note: Convex URLs typically expire after 1 hour, but we'll set a conservative expiration
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour in milliseconds

    return {
      url,
      expiresAt,
    };
  },
});

