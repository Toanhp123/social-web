export default () => ({
  oauth: {
    webAppUrl: process.env.WEB_APP_URL ?? 'http://localhost:3000',
    stateSecret: process.env.OAUTH_STATE_SECRET,
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3001/auth/google/callback',
    },
  },
});
