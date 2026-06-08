import { z } from "zod";

const PROFILE_FIELD_LIMITS = {
  bio: 500,
  website: 255,
  gender: 50,
  relationshipStatus: 100,
  locationName: 255,
} as const;

const PROFILE_IMAGE_LIMITS = {
  avatarMaxBytes: 5 * 1024 * 1024,
  coverMaxBytes: 10 * 1024 * 1024,
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

const PROFILE_IMAGE_MIME_TYPES = new Set<string>(
  PROFILE_IMAGE_LIMITS.mimeTypes,
);

const nullableString = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return null;

      return value.trim() || null;
    },
    z.string().max(maxLength, "Du lieu qua dai.").nullable(),
  );

const checkboxBoolean = z.preprocess((value) => value === "on", z.boolean());

const birthdaySchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;

    return value.trim() || null;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay sinh khong hop le.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Ngay sinh khong hop le.",
    })
    .nullable(),
);

export const saveProfileSchema = z.object({
  mode: z.enum(["create", "update"]).catch("update"),
  profile: z.object({
    bio: nullableString(PROFILE_FIELD_LIMITS.bio),
    website: nullableString(PROFILE_FIELD_LIMITS.website),
    gender: nullableString(PROFILE_FIELD_LIMITS.gender),
    relationshipStatus: nullableString(
      PROFILE_FIELD_LIMITS.relationshipStatus,
    ),
    birthday: birthdaySchema,
    isBirthdayPublic: checkboxBoolean,
    isFriendListPublic: checkboxBoolean,
    locationName: nullableString(PROFILE_FIELD_LIMITS.locationName),
  }),
});

export const uploadProfileImageSchema = z
  .object({
    kind: z.enum(["avatar", "cover"]).catch("avatar"),
    file: z.custom<File>(isNonEmptyFile, "Vui long chon anh de tai len."),
  })
  .superRefine((input, context) => {
    if (!PROFILE_IMAGE_MIME_TYPES.has(input.file.type)) {
      context.addIssue({
        code: "custom",
        path: ["file"],
        message: "Chi ho tro anh JPEG, PNG hoac WEBP.",
      });
    }

    const maxBytes =
      input.kind === "avatar"
        ? PROFILE_IMAGE_LIMITS.avatarMaxBytes
        : PROFILE_IMAGE_LIMITS.coverMaxBytes;

    if (input.file.size > maxBytes) {
      context.addIssue({
        code: "custom",
        path: ["file"],
        message: "Anh tai len qua lon.",
      });
    }
  });

export type SaveProfileInput = z.infer<typeof saveProfileSchema>;
export type UserProfileInput = SaveProfileInput["profile"];
export type UploadProfileImageInput = z.infer<typeof uploadProfileImageSchema>;

function isNonEmptyFile(value: unknown): value is File {
  return value instanceof File && value.size > 0;
}
