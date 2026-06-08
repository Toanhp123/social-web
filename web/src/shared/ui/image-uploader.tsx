"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ImagePlus } from "lucide-react";

type ImageUploaderProps<TResult> = {
  label: string;
  loadingLabel?: string;
  accept?: string;
  fileFieldName?: string;
  extraFields?: Record<string, string>;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  upload: (formData: FormData) => Promise<TResult>;
  onUploaded?: (result: TResult) => void;
  getErrorMessage?: (error: unknown) => string;
};

const DEFAULT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export function ImageUploader<TResult>({
  label,
  loadingLabel = "Dang tai...",
  accept = DEFAULT_IMAGE_ACCEPT,
  fileFieldName = "file",
  extraFields,
  disabled,
  icon,
  className,
  upload,
  onUploaded,
  getErrorMessage = defaultGetErrorMessage,
}: ImageUploaderProps<TResult>) {
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
        className={[
          "inline-flex cursor-pointer items-center gap-2 rounded-control",
          "border border-subtle bg-surface px-4 py-2 shadow-sm",
          "text-sm font-medium text-secondary hover:border-brand hover:text-brand",
          disabled || isUploading ? "pointer-events-none opacity-60" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {icon ?? <ImagePlus className="size-4" />}
        {isUploading ? loadingLabel : label}
        <input
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleChange}
          disabled={disabled || isUploading}
        />
      </label>

      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
    </div>
  );
}

function defaultGetErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Da co loi xay ra.";
}
