import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    onboardingCompleted: v.boolean(),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"])
    .index("by_phoneNumber", ["phoneNumber"]),

  cards: defineTable({
    userId: v.id("users"),
    shareId: v.string(),
    name: v.string(),
    title: v.optional(v.string()),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    bio: v.optional(v.string()),
    tags: v.array(v.string()),
    profilePhotoId: v.optional(v.id("_storage")),
    resumeFileId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_shareId", ["shareId"]),

  socialLinks: defineTable({
    cardId: v.id("cards"),
    platform: v.string(),
    url: v.string(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_cardId", ["cardId"])
    .index("by_cardId_platform", ["cardId", "platform"]),

  contacts: defineTable({
    ownerId: v.id("users"),
    sourceCardId: v.id("cards"),
    sourceUserId: v.id("users"),
    acceptedAt: v.number(),
    updatedAt: v.number(),
    tags: v.array(v.string()),
    meetingMetadataId: v.optional(v.id("meetingMetadata")),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_ownerId_sourceUserId", ["ownerId", "sourceUserId"])
    .index("by_sourceCardId", ["sourceCardId"]),

  meetingMetadata: defineTable({
    contactId: v.id("contacts"),
    date: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_contactId", ["contactId"]),
});

