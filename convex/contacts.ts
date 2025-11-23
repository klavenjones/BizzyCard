import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get all contacts for the current user.
 * Returns contacts with joined card data and meeting metadata.
 */
export const getByOwnerId = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const clerkUserId = identity.subject;

    // Find the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      return [];
    }

    // Get all contacts for this user
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .collect();

    // Join with card data and meeting metadata
    const contactsWithData = await Promise.all(
      contacts.map(async (contact) => {
        // Get the source card
        const card = await ctx.db.get(contact.sourceCardId);
        if (!card) {
          return null;
        }

        // Get meeting metadata if it exists
        let meetingMetadata = undefined;
        if (contact.meetingMetadataId) {
          meetingMetadata = await ctx.db.get(contact.meetingMetadataId);
        }

        return {
          _id: contact._id,
          ownerId: contact.ownerId,
          sourceCardId: contact.sourceCardId,
          sourceUserId: contact.sourceUserId,
          acceptedAt: contact.acceptedAt,
          updatedAt: contact.updatedAt,
          tags: contact.tags,
          meetingMetadataId: contact.meetingMetadataId,
          // Joined card data
          card: {
            name: card.name,
            title: card.title,
            email: card.email,
            phoneNumber: card.phoneNumber,
            company: card.company,
            role: card.role,
            bio: card.bio,
            tags: card.tags,
            profilePhotoId: card.profilePhotoId,
            resumeFileId: card.resumeFileId,
          },
          // Joined meeting metadata
          meetingMetadata: meetingMetadata
            ? {
                date: meetingMetadata.date,
                location: meetingMetadata.location,
                notes: meetingMetadata.notes,
              }
            : undefined,
        };
      })
    );

    // Filter out null entries (contacts with deleted cards)
    return contactsWithData.filter(
      (contact): contact is NonNullable<typeof contact> => contact !== null
    );
  },
});

/**
 * Get a specific contact by ID.
 * Returns contact with joined card data and meeting metadata.
 */
export const getById = query({
  args: {
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
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

    // Get the contact
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      return null;
    }

    // Verify the contact belongs to the current user
    if (contact.ownerId !== user._id) {
      return null;
    }

    // Get the source card
    const card = await ctx.db.get(contact.sourceCardId);
    if (!card) {
      return null;
    }

    // Get meeting metadata if it exists
    let meetingMetadata = undefined;
    if (contact.meetingMetadataId) {
      meetingMetadata = await ctx.db.get(contact.meetingMetadataId);
    }

    return {
      _id: contact._id,
      ownerId: contact.ownerId,
      sourceCardId: contact.sourceCardId,
      sourceUserId: contact.sourceUserId,
      acceptedAt: contact.acceptedAt,
      updatedAt: contact.updatedAt,
      tags: contact.tags,
      meetingMetadataId: contact.meetingMetadataId,
      // Joined card data
      card: {
        name: card.name,
        title: card.title,
        email: card.email,
        phoneNumber: card.phoneNumber,
        company: card.company,
        role: card.role,
        bio: card.bio,
        tags: card.tags,
        profilePhotoId: card.profilePhotoId,
        resumeFileId: card.resumeFileId,
      },
      // Joined meeting metadata
      meetingMetadata: meetingMetadata
        ? {
            date: meetingMetadata.date,
            location: meetingMetadata.location,
            notes: meetingMetadata.notes,
          }
        : undefined,
    };
  },
});

/**
 * Find duplicate contact by email or phone number.
 * Returns existing contact if duplicate found, null otherwise.
 */
async function findDuplicateContact(
  ctx: any,
  ownerId: Id<"users">,
  cardEmail: string,
  cardPhoneNumber?: string
): Promise<Id<"contacts"> | null> {
  // Get all contacts for this owner
  const ownerContacts = await ctx.db
    .query("contacts")
    .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
    .collect();

  // Try email first
  for (const contact of ownerContacts) {
    const card = await ctx.db.get(contact.sourceCardId);
    if (card && card.email.toLowerCase() === cardEmail.toLowerCase()) {
      return contact._id;
    }
  }

  // Fallback to phone number if provided
  if (cardPhoneNumber) {
    for (const contact of ownerContacts) {
      const card = await ctx.db.get(contact.sourceCardId);
      if (card && card.phoneNumber && card.phoneNumber === cardPhoneNumber) {
        return contact._id;
      }
    }
  }

  return null;
}

/**
 * Accept a shared card and add to network (with duplicate detection).
 * If duplicate found (by email or phone), updates existing contact instead of creating new.
 */
export const acceptCard = mutation({
  args: {
    sourceCardId: v.id("cards"),
    sourceUserId: v.id("users"),
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

    // Verify the source card exists
    const sourceCard = await ctx.db.get(args.sourceCardId);
    if (!sourceCard) {
      throw new Error("Card not found");
    }

    // Verify the source user exists
    const sourceUser = await ctx.db.get(args.sourceUserId);
    if (!sourceUser) {
      throw new Error("Source user not found");
    }

    // Prevent users from adding their own card as a contact
    if (args.sourceUserId === currentUser._id) {
      throw new Error("Cannot add own card as contact");
    }

    const now = Date.now();

    // Check for duplicate contact (email-first, phone-fallback)
    const duplicateContactId = await findDuplicateContact(
      ctx,
      currentUser._id,
      sourceCard.email,
      sourceCard.phoneNumber
    );

    if (duplicateContactId) {
      // Update existing contact with new card data
      await ctx.db.patch(duplicateContactId, {
        sourceCardId: args.sourceCardId,
        sourceUserId: args.sourceUserId,
        updatedAt: now,
      });

      const updatedContact = await ctx.db.get(duplicateContactId);
      return {
        _id: updatedContact!._id,
        ownerId: updatedContact!.ownerId,
        sourceCardId: updatedContact!.sourceCardId,
        sourceUserId: updatedContact!.sourceUserId,
        acceptedAt: updatedContact!.acceptedAt,
        updatedAt: updatedContact!.updatedAt,
        isUpdate: true,
      };
    } else {
      // Create new contact
      const contactId = await ctx.db.insert("contacts", {
        ownerId: currentUser._id,
        sourceCardId: args.sourceCardId,
        sourceUserId: args.sourceUserId,
        acceptedAt: now,
        updatedAt: now,
        tags: [],
      });

      const newContact = await ctx.db.get(contactId);
      return {
        _id: newContact!._id,
        ownerId: newContact!.ownerId,
        sourceCardId: newContact!.sourceCardId,
        sourceUserId: newContact!.sourceUserId,
        acceptedAt: newContact!.acceptedAt,
        updatedAt: newContact!.updatedAt,
        isUpdate: false,
      };
    }
  },
});

/**
 * Update tags for a contact.
 */
export const updateTags = mutation({
  args: {
    contactId: v.id("contacts"),
    tags: v.array(v.string()),
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

    // Get the contact
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // Verify the contact belongs to the current user
    if (contact.ownerId !== currentUser._id) {
      throw new Error("Contact does not belong to current user");
    }

    // Update tags
    await ctx.db.patch(args.contactId, {
      tags: args.tags,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.contactId);
  },
});

/**
 * Add or update meeting metadata for a contact.
 */
export const addMeetingMetadata = mutation({
  args: {
    contactId: v.id("contacts"),
    date: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
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

    // Get the contact
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // Verify the contact belongs to the current user
    if (contact.ownerId !== currentUser._id) {
      throw new Error("Contact does not belong to current user");
    }

    const now = Date.now();

    // Check if meeting metadata already exists
    if (contact.meetingMetadataId) {
      // Update existing meeting metadata
      await ctx.db.patch(contact.meetingMetadataId, {
        date: args.date,
        location: args.location,
        notes: args.notes,
        updatedAt: now,
      });
      return await ctx.db.get(contact.meetingMetadataId);
    } else {
      // Create new meeting metadata
      const meetingMetadataId = await ctx.db.insert("meetingMetadata", {
        contactId: args.contactId,
        date: args.date,
        location: args.location,
        notes: args.notes,
        createdAt: now,
        updatedAt: now,
      });

      // Update contact to reference the meeting metadata
      await ctx.db.patch(args.contactId, {
        meetingMetadataId: meetingMetadataId,
        updatedAt: now,
      });

      return await ctx.db.get(meetingMetadataId);
    }
  },
});

/**
 * Remove a contact from the network.
 */
export const remove = mutation({
  args: {
    contactId: v.id("contacts"),
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

    // Get the contact
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // Verify the contact belongs to the current user
    if (contact.ownerId !== currentUser._id) {
      throw new Error("Contact does not belong to current user");
    }

    // Delete meeting metadata if it exists
    if (contact.meetingMetadataId) {
      await ctx.db.delete(contact.meetingMetadataId);
    }

    // Delete the contact
    await ctx.db.delete(args.contactId);

    return { success: true };
  },
});

