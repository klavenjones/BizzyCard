/**
 * Supabase Storage Service
 * 
 * Handles file uploads and downloads to/from Supabase Storage.
 * Provides functions for uploading profile pictures and resumes.
 * 
 * Task: T049 [US1]
 */

import { supabase } from './client';
import * as FileSystem from 'expo-file-system';

const PROFILE_PICTURES_BUCKET = 'profile-pictures';
const RESUMES_BUCKET = 'resumes';

/**
 * Upload a profile picture to Supabase Storage
 * @param userId - Clerk user ID
 * @param imageUri - Local file URI from image picker
 * @returns Public URL of uploaded image
 */
export async function uploadProfilePicture(
  userId: string,
  imageUri: string
): Promise<string> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Determine file extension from URI
    const extension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${Date.now()}.${extension}`;
    const filePath = `${fileName}`;

    // Convert base64 to blob
    // Use FileSystem.EncodingType.Base64 which is already decoded
    // For React Native, we need to use a different approach
    const response = await fetch(`data:image/${extension};base64,${base64}`);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(PROFILE_PICTURES_BUCKET)
      .upload(filePath, blob, {
        contentType: `image/${extension}`,
        upsert: true, // Replace existing file if it exists
      });

    if (error) {
      throw new Error(`Failed to upload profile picture: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(PROFILE_PICTURES_BUCKET).getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return publicUrl;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload profile picture');
  }
}

/**
 * Delete a profile picture from Supabase Storage
 * @param imageUrl - Public URL of the image to delete
 */
export async function deleteProfilePicture(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/profile-pictures/{path}
    const urlParts = imageUrl.split('/');
    const fileNameIndex = urlParts.findIndex((part) => part === PROFILE_PICTURES_BUCKET);
    if (fileNameIndex === -1 || fileNameIndex === urlParts.length - 1) {
      throw new Error('Invalid image URL');
    }
    const filePath = urlParts.slice(fileNameIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(PROFILE_PICTURES_BUCKET)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete profile picture: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete profile picture');
  }
}

/**
 * Upload a resume PDF to Supabase Storage
 * @param userId - Clerk user ID
 * @param fileUri - Local file URI from document picker
 * @param fileName - Original file name
 * @returns Object with file URL, name, and size
 */
export async function uploadResume(
  userId: string,
  fileUri: string,
  fileName: string
): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
  try {
    // Read file info
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileInfo.size && fileInfo.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Ensure file name has .pdf extension
    const sanitizedFileName = fileName.endsWith('.pdf')
      ? fileName
      : `${fileName}.pdf`;
    const filePath = `${userId}/${Date.now()}_${sanitizedFileName}`;

    // Convert base64 to blob
    // Use fetch with data URI for React Native compatibility
    const response = await fetch(`data:application/pdf;base64,${base64}`);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(RESUMES_BUCKET)
      .upload(filePath, blob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload resume: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(RESUMES_BUCKET).getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded resume');
    }

    return {
      fileUrl: publicUrl,
      fileName: sanitizedFileName,
      fileSize: fileInfo.size || 0,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload resume');
  }
}

/**
 * Delete a resume from Supabase Storage
 * @param fileUrl - Public URL of the resume to delete
 */
export async function deleteResume(fileUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const fileNameIndex = urlParts.findIndex((part) => part === RESUMES_BUCKET);
    if (fileNameIndex === -1 || fileNameIndex === urlParts.length - 1) {
      throw new Error('Invalid resume URL');
    }
    const filePath = urlParts.slice(fileNameIndex + 1).join('/');

    const { error } = await supabase.storage.from(RESUMES_BUCKET).remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete resume: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete resume');
  }
}

