/**
 * Image Picker Utility
 * 
 * Wrapper around expo-image-picker for selecting and processing images.
 * Handles permissions and image validation.
 * 
 * Task: T048 [US1]
 */

import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type: string;
  fileSize?: number;
}

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const DEFAULT_OPTIONS: ImagePickerOptions = {
  allowsEditing: true,
  aspect: [1, 1], // Square aspect ratio for profile pictures
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
};

/**
 * Request camera permissions
 */
export async function requestCameraPermissions(): Promise<boolean> {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }
  return true;
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }
  return true;
}

/**
 * Pick an image from the media library
 */
export async function pickImageFromLibrary(
  options: ImagePickerOptions = {}
): Promise<ImagePickerResult | null> {
  const hasPermission = await requestMediaLibraryPermissions();
  if (!hasPermission) {
    throw new Error('Media library permission denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: options.allowsEditing ?? DEFAULT_OPTIONS.allowsEditing,
    aspect: options.aspect ?? DEFAULT_OPTIONS.aspect,
    quality: options.quality ?? DEFAULT_OPTIONS.quality,
    ...(options.maxWidth && { allowsMultipleSelection: false }),
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset) {
    return null;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (asset.fileSize && asset.fileSize > maxSize) {
    throw new Error('Image size exceeds 5MB limit');
  }

  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    type: asset.type || 'image',
    fileSize: asset.fileSize,
  };
}

/**
 * Take a photo using the camera
 */
export async function takePhoto(
  options: ImagePickerOptions = {}
): Promise<ImagePickerResult | null> {
  const hasPermission = await requestCameraPermissions();
  if (!hasPermission) {
    throw new Error('Camera permission denied');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: options.allowsEditing ?? DEFAULT_OPTIONS.allowsEditing,
    aspect: options.aspect ?? DEFAULT_OPTIONS.aspect,
    quality: options.quality ?? DEFAULT_OPTIONS.quality,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset) {
    return null;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (asset.fileSize && asset.fileSize > maxSize) {
    throw new Error('Image size exceeds 5MB limit');
  }

  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    type: asset.type || 'image',
    fileSize: asset.fileSize,
  };
}

/**
 * Show image picker options (camera or library)
 * Returns the selected image or null if cancelled
 */
export async function showImagePicker(
  options: ImagePickerOptions = {}
): Promise<ImagePickerResult | null> {
  // For now, default to library picker
  // In the future, this could show an action sheet with camera/library options
  return pickImageFromLibrary(options);
}

