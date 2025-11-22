import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

/**
 * File upload service for handling file operations.
 * 
 * This service provides utilities for:
 * - Picking files from device
 * - Picking images from device
 * - Validating file types and sizes
 * - Preparing files for upload to Convex
 */

export interface FileInfo {
  uri: string;
  name: string;
  mimeType: string | null;
  size: number | null;
}

export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  mimeType: string | null;
  size: number | null;
}

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  PROFILE_PHOTO: 5 * 1024 * 1024, // 5MB
  RESUME: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Allowed MIME types for profile photos
 */
export const ALLOWED_PROFILE_PHOTO_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

/**
 * Allowed MIME types for resume files
 */
export const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain",
] as const;

/**
 * Picks a document file from the device.
 * @param options - Document picker options
 * @returns File info or null if cancelled
 */
export async function pickDocument(
  options?: DocumentPicker.DocumentPickerOptions
): Promise<FileInfo | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      ...options,
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];
    return {
      uri: file.uri,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ?? null,
    };
  } catch (error) {
    console.error("Error picking document:", error);
    throw error;
  }
}

/**
 * Picks an image from the device (camera or gallery).
 * @param options - Image picker options
 * @returns Image info or null if cancelled
 */
export async function pickImage(
  options?: ImagePicker.ImagePickerOptions
): Promise<ImageInfo | null> {
  try {
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      throw new Error("Media library permissions not granted");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      ...options,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType ?? null,
      size: asset.fileSize ?? null,
    };
  } catch (error) {
    console.error("Error picking image:", error);
    throw error;
  }
}

/**
 * Validates file size against maximum allowed size.
 * @param fileSize - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns true if file size is valid, false otherwise
 */
export function validateFileSize(fileSize: number | null, maxSize: number): boolean {
  if (fileSize === null) {
    return false;
  }
  return fileSize <= maxSize;
}

/**
 * Validates MIME type against allowed types.
 * @param mimeType - MIME type to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if MIME type is allowed, false otherwise
 */
export function validateMimeType(
  mimeType: string | null,
  allowedTypes: readonly string[]
): boolean {
  if (!mimeType) {
    return false;
  }
  return allowedTypes.includes(mimeType);
}

/**
 * Validates a profile photo file.
 * @param file - File info to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateProfilePhoto(file: FileInfo | ImageInfo): {
  valid: boolean;
  error?: string;
} {
  if (!file.mimeType) {
    return {
      valid: false,
      error: "File type could not be determined",
    };
  }

  if (!validateMimeType(file.mimeType, ALLOWED_PROFILE_PHOTO_TYPES)) {
    return {
      valid: false,
      error: "Profile photo must be a JPEG, PNG, or WebP image",
    };
  }

  if (!validateFileSize(file.size, MAX_FILE_SIZES.PROFILE_PHOTO)) {
    return {
      valid: false,
      error: `Profile photo must be less than ${MAX_FILE_SIZES.PROFILE_PHOTO / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validates a resume file.
 * @param file - File info to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateResume(file: FileInfo): {
  valid: boolean;
  error?: string;
} {
  if (!file.mimeType) {
    return {
      valid: false,
      error: "File type could not be determined",
    };
  }

  if (!validateMimeType(file.mimeType, ALLOWED_RESUME_TYPES)) {
    return {
      valid: false,
      error: "Resume must be a PDF, DOC, DOCX, or TXT file",
    };
  }

  if (!validateFileSize(file.size, MAX_FILE_SIZES.RESUME)) {
    return {
      valid: false,
      error: `Resume must be less than ${MAX_FILE_SIZES.RESUME / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Reads file content as base64 string (for Convex file upload).
 * @param uri - File URI
 * @returns Base64 encoded file content
 */
export async function readFileAsBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error("Error reading file as base64:", error);
    throw error;
  }
}

