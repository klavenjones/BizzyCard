export default {
  providers: [
    {
      domain: process.env.EXPO_PUBLIC_APP_CLERK_JWT_ISSUER_DOMAIN,
      applicationID: 'convex',
    },
  ],
};
