import { ConvexReactClient } from 'convex/react';

/**
 * Convex client instance for the application.
 *
 * This client is configured with the Convex URL from environment variables.
 * It should be used with ConvexProvider in the app root layout.
 */
export const convexClient = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);
