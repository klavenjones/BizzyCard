# Test Utilities

This directory contains mock utilities for testing components and hooks that depend on external services.

## Available Mocks

### `mock-convex.ts`
Mock utilities for Convex queries, mutations, and actions.

**Usage:**
```typescript
import { mockUseQuery, mockUseMutation } from "@/__tests__/utils/mock-convex";

// Mock a query
const mockQuery = mockUseQuery({ name: "John Doe", email: "john@example.com" });
jest.mock("convex/react", () => ({
  useQuery: mockQuery,
}));

// Mock a mutation
const mockMutation = mockUseMutation(async (args) => {
  return { success: true, id: "card_123" };
});
jest.mock("convex/react", () => ({
  useMutation: mockMutation,
}));
```

### `mock-clerk.ts`
Mock utilities for Clerk authentication hooks.

**Usage:**
```typescript
import { mockUseUser, mockUseAuth } from "@/__tests__/utils/mock-clerk";

// Mock authenticated user
const mockUser = mockUseUser({
  id: "user_123",
  emailAddresses: [{ emailAddress: "test@example.com" }],
});

jest.mock("@clerk/clerk-expo", () => ({
  useUser: mockUser,
  useAuth: mockUseAuth(true, "user_123"),
}));
```

### `mock-expo.ts`
Mock utilities for Expo SDK APIs (ImagePicker, DocumentPicker, Sharing, etc.).

**Usage:**
```typescript
import { mockImagePicker, mockDocumentPicker } from "@/__tests__/utils/mock-expo";

jest.mock("expo-image-picker", () => mockImagePicker);
jest.mock("expo-document-picker", () => mockDocumentPicker);

// In your test
import * as ImagePicker from "expo-image-picker";
const result = await ImagePicker.launchImageLibraryAsync();
```

### `setup.ts`
Jest setup file that runs before all tests. Configures the test environment and mocks React Native modules.

## Example Test

```typescript
import { render } from "@testing-library/react-native";
import { mockUseQuery } from "@/__tests__/utils/mock-convex";
import { mockUseUser } from "@/__tests__/utils/mock-clerk";
import { MyComponent } from "@/components/my-component";

// Setup mocks
jest.mock("convex/react", () => ({
  useQuery: mockUseQuery({ data: "test" }),
}));

jest.mock("@clerk/clerk-expo", () => ({
  useUser: mockUseUser(),
}));

describe("MyComponent", () => {
  it("renders correctly", () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText("Hello")).toBeTruthy();
  });
});
```

