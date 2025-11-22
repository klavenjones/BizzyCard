/**
 * Mock utilities for Clerk authentication
 * Use these mocks to test components that use Clerk hooks and functions
 */

import React from "react";
import { jest } from "@jest/globals";

/**
 * Mock Clerk user object
 */
export const mockClerkUser = {
  id: "user_test123",
  emailAddresses: [
    {
      emailAddress: "test@example.com",
      id: "email_test123",
    },
  ],
  phoneNumbers: [],
  firstName: "Test",
  lastName: "User",
  imageUrl: "https://example.com/avatar.jpg",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Mock Clerk session
 */
export const mockClerkSession = {
  id: "session_test123",
  userId: "user_test123",
  status: "active" as const,
  lastActiveAt: Date.now(),
};

/**
 * Mock useUser hook
 * @param user - Optional user object to return (defaults to mockClerkUser)
 * @param isLoaded - Whether the user data is loaded
 */
export const mockUseUser = (
  user: typeof mockClerkUser | null = mockClerkUser,
  isLoaded: boolean = true
) => {
  return jest.fn(() => ({
    user,
    isLoaded,
    isSignedIn: !!user,
  }));
};

/**
 * Mock useAuth hook
 * @param isSignedIn - Whether the user is signed in
 * @param userId - Optional user ID
 */
export const mockUseAuth = (
  isSignedIn: boolean = true,
  userId: string | null = "user_test123"
) => {
  return jest.fn(() => ({
    isSignedIn,
    userId,
    sessionId: isSignedIn ? "session_test123" : null,
    signOut: jest.fn(),
    signIn: jest.fn(),
  }));
};

/**
 * Mock useSession hook
 * @param session - Optional session object (defaults to mockClerkSession)
 * @param isLoaded - Whether the session is loaded
 */
export const mockUseSession = (
  session: typeof mockClerkSession | null = mockClerkSession,
  isLoaded: boolean = true
) => {
  return jest.fn(() => ({
    session,
    isLoaded,
    isSignedIn: !!session,
  }));
};

/**
 * Mock Clerk provider wrapper for testing
 */
export const createMockClerkProvider = (
  user: typeof mockClerkUser | null = mockClerkUser
) => {
  return ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };
};

