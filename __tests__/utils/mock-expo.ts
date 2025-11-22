/**
 * Mock utilities for Expo APIs
 * Use these mocks to test components that use Expo SDK capabilities
 */

import { jest } from "@jest/globals";

/**
 * Mock expo-image-picker
 */
export const mockImagePicker = {
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      cancelled: false,
      assets: [
        {
          uri: "file:///test/image.jpg",
          width: 100,
          height: 100,
          type: "image",
        },
      ],
    })
  ),
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({
      cancelled: false,
      assets: [
        {
          uri: "file:///test/image.jpg",
          width: 100,
          height: 100,
          type: "image",
        },
      ],
    })
  ),
  MediaTypeOptions: {
    Images: "images",
    Videos: "videos",
    All: "all",
  },
};

/**
 * Mock expo-document-picker
 */
export const mockDocumentPicker = {
  getDocumentAsync: jest.fn(() =>
    Promise.resolve({
      type: "success",
      uri: "file:///test/document.pdf",
      name: "document.pdf",
      mimeType: "application/pdf",
      size: 1024,
    })
  ),
};

/**
 * Mock expo-sharing
 */
export const mockSharing = {
  shareAsync: jest.fn(() => Promise.resolve({ action: "sharedAction" })),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
};

/**
 * Mock expo-file-system
 */
export const mockFileSystem = {
  documentDirectory: "file:///test/documents/",
  cacheDirectory: "file:///test/cache/",
  readAsStringAsync: jest.fn(() => Promise.resolve("file content")),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() =>
    Promise.resolve({
      exists: true,
      isDirectory: false,
      size: 1024,
      uri: "file:///test/file.txt",
    })
  ),
};

/**
 * Mock expo-notifications
 */
export const mockNotifications = {
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({
      status: "granted",
      canAskAgain: false,
    })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({
      status: "granted",
      canAskAgain: false,
    })
  ),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve("notification-id")),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
};

/**
 * Mock expo-linking
 */
export const mockLinking = {
  openURL: jest.fn(() => Promise.resolve(true)),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
};

/**
 * Setup Expo mocks for Jest
 * Call this in your test setup or individual test files
 */
export const setupExpoMocks = () => {
  jest.mock("expo-image-picker", () => mockImagePicker);
  jest.mock("expo-document-picker", () => mockDocumentPicker);
  jest.mock("expo-sharing", () => mockSharing);
  jest.mock("expo-file-system", () => mockFileSystem);
  jest.mock("expo-notifications", () => mockNotifications);
  jest.mock("expo-linking", () => mockLinking);
};

