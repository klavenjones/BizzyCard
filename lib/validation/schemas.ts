/**
 * Zod validation schemas for forms and API requests
 */

import { z } from 'zod';

// Social platform enum
export const socialPlatformSchema = z.enum([
  'bluesky',
  'linkedin',
  'x',
  'facebook',
  'instagram',
  'github',
  'portfolio',
  'other',
]);

// Social link schema
export const socialLinkSchema = z.object({
  platform: socialPlatformSchema,
  url: z.string().url('Must be a valid URL'),
  display_order: z.number().int().min(0).max(99).default(0),
  visible: z.boolean().default(true),
});

// Profile schema
export const profileSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  title: z.string().max(100, 'Title must be 100 characters or less').optional().nullable(),
  company: z.string().max(100, 'Company must be 100 characters or less').optional().nullable(),
  role: z.string().max(100, 'Role must be 100 characters or less').optional().nullable(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().nullable(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(20, 'Maximum 20 tags allowed')
    .default([]),
  resume_visible: z.boolean().default(true),
});

// Profile update schema (all fields optional except user_id)
export const profileUpdateSchema = profileSchema.partial();

// Social links array schema
export const socialLinksSchema = z.array(socialLinkSchema).max(20, 'Maximum 20 social links allowed');

