export default () => ({
  email: {
    host: process.env.SMTP_HOST?.trim() || undefined,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER?.trim() || undefined,
    pass: process.env.SMTP_PASS?.trim() || undefined,
    from: process.env.EMAIL_FROM?.trim() || 'Social Web <no-reply@localhost>',
    verificationTokenTtlMinutes:
      Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES) || 30,
    passwordResetTokenTtlMinutes:
      Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES) || 30,
  },
});
