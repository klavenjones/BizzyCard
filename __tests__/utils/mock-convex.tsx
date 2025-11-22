/**
 * Mock utilities for Convex functions and hooks
 * Use these mocks to test components that use Convex queries and mutations
 */

import React from "react";
import { jest } from "@jest/globals";

/**
 * Mock Convex useQuery hook
 * @param data - The data to return from the query
 * @param isLoading - Whether the query is loading
 * @param error - Optional error to return
 */
export const mockUseQuery = <T>(
  data: T | null = null,
  isLoading: boolean = false,
  error: Error | null = null
) => {
  return jest.fn(() => {
    if (error) throw error;
    return { data, isLoading };
  });
};

/**
 * Mock Convex useMutation hook
 * @param mockMutation - Optional function to mock the mutation behavior
 */
export const mockUseMutation = (
  mockMutation?: (args: any) => Promise<any>
) => {
  const mutation = jest.fn(
    mockMutation || (async (args: any) => ({ success: true, ...args }))
  );
  return jest.fn(() => mutation);
};

/**
 * Mock Convex useAction hook
 * @param mockAction - Optional function to mock the action behavior
 */
export const mockUseAction = (mockAction?: (args: any) => Promise<any>) => {
  const action = jest.fn(
    mockAction || (async (args: any) => ({ success: true, ...args }))
  );
  return jest.fn(() => action);
};

/**
 * Create a mock Convex provider wrapper for testing
 * This can be used to wrap components in tests that need Convex context
 */
export const createMockConvexProvider = (mockData: Record<string, any> = {}) => {
  return ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };
};

/**
 * Mock Convex client
 */
export const mockConvexClient = {
  query: jest.fn(),
  mutation: jest.fn(),
  action: jest.fn(),
  close: jest.fn(),
};

