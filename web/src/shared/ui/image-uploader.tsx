"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";

type ImageUploaderProps<TResult> = {
  label: string;
  loadingLabel?: string;
  accept?: string;
  fileFieldName?: string;
  extraFields?: Record<string, string>;
  size?: "sm" | "md";
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  upload: (formData: FormData) => Promise<TResult>;
  onUploaded?: (result: TResult) => void;
  getErrorMessage?: (error: unknown) => string;
};

const DEFAULT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

const imageUploaderSizeClass = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2 text-sm",
} satisfies Record<NonNullable<ImageUploaderProps<unknown>["size"]>, string>;

export function ImageUploader<TResult>({
  label,
  loadingLabel,
  accept = DEFAULT_IMAGE_ACCEPT,
  fileFieldName = "file",
  extraFields,
  size = "md",
  disabled,
  icon,
  className,
  upload,
  onUploaded,
  getErrorMessage = defaultGetErrorMessage,
}: ImageUploaderProps<TResult>) {
  const t = useTranslations().shared;
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.set(fileFieldName, file);

    Object.entries(extraFields ?? {}).forEach(([key, value]) => {
      formData.set(key, value);
    });

    setIsUploading(true);
    setErrorMessage("");

    try {
      const result = await upload(formData);
      onUploaded?.(result);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label
        className={cn(
          "rounded-control inline-flex cursor-pointer items-center gap-2",
          "border-subtle bg-surface shadow-control border",
          "text-secondary hover:border-brand hover:text-brand font-medium",
          imageUploaderSizeClass[size],
          (disabled || isUploading) && "pointer-events-none opacity-60",
          className,
        )}
      >
        {icon ?? <ImagePlus className="size-4" />}
        {isUploading ? loadingLabel || t.uploading : label}
        <input
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleChange}
          disabled={disabled || isUploading}
        />
      </label>

      {errorMessage && <p className="text-danger text-xs">{errorMessage}</p>}
    </div>
  );
}

function defaultGetErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
