import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { httpRouter } from "convex/server";
import type { ActionCtx } from "./_generated/server";
import { generateVCard } from "../lib/vcf";

/**
 * Main HTTP handler for public endpoints.
 * Routes to appropriate handler based on path:
 * - GET /public/:shareId - Card view
 * - GET /public/:shareId/vcf - vCard download
 * - GET /public/:shareId/resume - Resume download
 */
const publicHandler = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  // Validate path starts with "public"
  if (pathParts.length < 2 || pathParts[0] !== "public") {
    return new Response("Invalid path", { status: 400 });
  }

  const shareId = pathParts[1];
  const action = pathParts[2]; // "vcf", "resume", or undefined

  // Route to appropriate handler
  if (action === "vcf") {
    return handleVcfDownload(ctx, shareId);
  } else if (action === "resume") {
    return handleResumeDownload(ctx, shareId);
  } else if (pathParts.length === 2) {
    // Just /public/:shareId - card view
    return handleCardView(ctx, shareId);
  } else {
    return new Response("Invalid path", { status: 400 });
  }
});

/**
 * Handle public card view.
 * GET /public/:shareId
 * Returns card data with profile photo and resume URLs for public web view.
 */
async function handleCardView(ctx: ActionCtx, shareId: string) {

  try {
    // Get card by shareId (this query doesn't require auth)
    const card = await ctx.runQuery(api.cards.getByShareId, { shareId });

    if (!card) {
      return new Response(
        JSON.stringify({ error: "Card not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get social links for the card
    const socialLinks = await ctx.runQuery(api.socialLinks.getByCardId, {
      cardId: card._id,
    });

    // Get profile photo URL if exists
    let profilePhotoUrl: string | undefined;
    if (card.profilePhotoId) {
      const photoUrlData = await ctx.runQuery(api.files.getUrl, {
        fileId: card.profilePhotoId,
      });
      profilePhotoUrl = photoUrlData.url;
    }

    // Get resume file URL if exists
    let resumeFileUrl: string | undefined;
    if (card.resumeFileId) {
      const resumeUrlData = await ctx.runQuery(api.files.getUrl, {
        fileId: card.resumeFileId,
      });
      resumeFileUrl = resumeUrlData.url;
    }

    // Format response according to contract
    const response = {
      card: {
        name: card.name,
        title: card.title,
        email: card.email,
        phoneNumber: card.phoneNumber,
        company: card.company,
        role: card.role,
        bio: card.bio,
        tags: card.tags,
        profilePhotoUrl,
        resumeFileUrl,
        socialLinks: socialLinks.map((link) => ({
          platform: link.platform,
          url: link.url,
        })),
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow CORS for public access
      },
    });
  } catch (error) {
    console.error("Error in publicCardView:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Handle vCard (.vcf) download.
 * GET /public/:shareId/vcf
 * Returns a vCard file for the shared card.
 */
async function handleVcfDownload(ctx: ActionCtx, shareId: string) {
  try {
    // Get card by shareId
    const card = await ctx.runQuery(api.cards.getByShareId, { shareId });

    if (!card) {
      return new Response(
        JSON.stringify({ error: "Card not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get social links for the card
    const socialLinks = await ctx.runQuery(api.socialLinks.getByCardId, {
      cardId: card._id,
    });

    // Get profile photo URL if exists
    let profilePhotoUrl: string | undefined;
    if (card.profilePhotoId) {
      const photoUrlData = await ctx.runQuery(api.files.getUrl, {
        fileId: card.profilePhotoId,
      });
      profilePhotoUrl = photoUrlData.url;
    }

    // Generate vCard content
    const vcardData = {
      name: card.name,
      title: card.title,
      email: card.email,
      phoneNumber: card.phoneNumber,
      company: card.company,
      role: card.role,
      bio: card.bio,
      tags: card.tags,
      profilePhotoUrl,
      socialLinks: socialLinks.map((link) => ({
        platform: link.platform,
        url: link.url,
      })),
    };

    const vcfContent = generateVCard(vcardData);

    // Return vCard file
    return new Response(vcfContent, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard",
        "Content-Disposition": `attachment; filename="${card.name.replace(/[^a-z0-9]/gi, "_")}.vcf"`,
        "Access-Control-Allow-Origin": "*", // Allow CORS for public access
      },
    });
  } catch (error) {
    console.error("Error in handleVcfDownload:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Handle resume download.
 * GET /public/:shareId/resume
 * Returns the resume file for the shared card.
 */
async function handleResumeDownload(ctx: ActionCtx, shareId: string) {
  try {
    // Get card by shareId
    const card = await ctx.runQuery(api.cards.getByShareId, { shareId });

    if (!card) {
      return new Response(
        JSON.stringify({ error: "Card not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if resume exists
    if (!card.resumeFileId) {
      return new Response(
        JSON.stringify({ error: "Resume not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get resume file URL
    const resumeUrlData = await ctx.runQuery(api.files.getUrl, {
      fileId: card.resumeFileId,
    });

    // Get file metadata to determine content type
    const file = await ctx.storage.get(card.resumeFileId);
    if (!file) {
      return new Response(
        JSON.stringify({ error: "Resume file not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the file content
    const fileResponse = await fetch(resumeUrlData.url);
    if (!fileResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch resume file" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const fileContent = await fileResponse.arrayBuffer();

    // Determine content type from file name or default to application/pdf
    const contentType = file.contentType || "application/pdf";
    const fileName = file.name || `resume_${card.name.replace(/[^a-z0-9]/gi, "_")}.pdf`;

    // Return resume file
    return new Response(fileContent, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Access-Control-Allow-Origin": "*", // Allow CORS for public access
      },
    });
  } catch (error) {
    console.error("Error in handleResumeDownload:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Create HTTP router and register routes
const http = httpRouter();

// Register public endpoints using pathPrefix to handle dynamic shareId
http.route({
  pathPrefix: "/public/",
  method: "GET",
  handler: publicHandler,
});

// Export the HTTP router
export default http;

