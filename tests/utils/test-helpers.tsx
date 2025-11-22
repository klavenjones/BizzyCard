import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-expo';

/**
 * Custom render function that wraps components with necessary providers
 * Use this instead of the default render from @testing-library/react-native
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }): ReactElement => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <ClerkProvider publishableKey="pk_test_mock">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ClerkProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };

/**
 * Mock Supabase client factory
 */
export const createMockSupabaseClient = () => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
  },
});

/**
 * Wait for async operations to complete
 */
export const waitForAsync = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Create mock profile data
 */
export const createMockProfile = (overrides = {}) => ({
  id: 'test-profile-id',
  user_id: 'test-user-id',
  email: 'test@example.com',
  phone: '+1234567890',
  name: 'Test User',
  title: 'Software Engineer',
  company: 'Test Company',
  role: 'Senior Developer',
  bio: 'Test bio',
  tags: ['tech', 'developer'],
  profile_picture_url: null,
  profile_picture_initials: 'TU',
  resume_visible: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  deleted_at: null,
  ...overrides,
});

/**
 * Create mock social link data
 */
export const createMockSocialLink = (overrides = {}) => ({
  id: 'test-social-link-id',
  profile_id: 'test-profile-id',
  platform: 'linkedin',
  url: 'https://linkedin.com/in/test',
  display_order: 0,
  visible: true,
  created_at: '2025-01-01T00:00:00Z',
  ...overrides,
});
