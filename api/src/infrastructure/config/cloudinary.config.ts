function readOptionalEnv(key: string): string | undefined {
  return process.env[key]?.trim() || undefined;
}

export default () => ({
  cloudinary: {
    cloudName: readOptionalEnv('CLOUDINARY_CLOUD_NAME'),
    apiKey: readOptionalEnv('CLOUDINARY_API_KEY'),
    apiSecret: readOptionalEnv('CLOUDINARY_API_SECRET'),
    uploadFolder: readOptionalEnv('CLOUDINARY_UPLOAD_FOLDER') ?? 'social-web',
    secure: process.env.CLOUDINARY_SECURE !== 'false',
  },
});
