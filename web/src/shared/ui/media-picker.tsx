"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";

export type PickedMediaFile = {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
};

type MediaPickerProps = {
  name: string;
  label: string;
  size?: "sm" | "md";
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
  onFilesChange?: (files: File[]) => void;
};

const DEFAULT_MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime";

const mediaPickerTriggerSizeClass = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2 text-sm",
} satisfies Record<NonNullable<MediaPickerProps["size"]>, string>;

const mediaPickerGridClass = {
  sm: "grid-cols-2",
  md: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
} satisfies Record<NonNullable<MediaPickerProps["size"]>, string>;

export function MediaPicker({
  name,
  label,
  size = "md",
  accept = DEFAULT_MEDIA_ACCEPT,
  maxFiles = 10,
  disabled,
  onFilesChange,
}: MediaPickerProps) {
  const t = useTranslations().shared;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<PickedMediaFile[]>([]);

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [items]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (nextFiles.length === 0) {
      return;
    }

    setItems((currentItems) => {
      const availableSlots = Math.max(maxFiles - currentItems.length, 0);
      const selectedFiles = nextFiles.slice(0, availableSlots);
      const nextItems = [
        ...currentItems,
        ...selectedFiles.map(
          (file) =>
            ({
              id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
              file,
              previewUrl: URL.createObjectURL(file),
              type: file.type.startsWith("video/") ? "video" : "image",
            }) satisfies PickedMediaFile,
        ),
      ];

      syncInputFiles(nextItems);
      onFilesChange?.(nextItems.map((item) => item.file));

      return nextItems;
    });
  }

  function removeItem(id: string) {
    setItems((currentItems) => {
      const removedItem = currentItems.find((item) => item.id === id);
      const nextItems = currentItems.filter((item) => item.id !== id);

      if (removedItem) {
        URL.revokeObjectURL(removedItem.previewUrl);
      }

      syncInputFiles(nextItems);
      onFilesChange?.(nextItems.map((item) => item.file));

      return nextItems;
    });
  }

  function syncInputFiles(nextItems: PickedMediaFile[]) {
    if (!inputRef.current) {
      return;
    }

    const dataTransfer = new DataTransfer();
    nextItems.forEach((item) => dataTransfer.items.add(item.file));
    inputRef.current.files = dataTransfer.files;
  }

  return (
    <div className="space-y-3">
      <label
        className={cn(
          "rounded-control inline-flex cursor-pointer items-center gap-2",
          "border-subtle bg-surface-soft border",
          "text-secondary hover:border-brand hover:bg-surface text-sm font-medium",
          mediaPickerTriggerSizeClass[size],
          (disabled || items.length >= maxFiles) &&
            "pointer-events-none opacity-60",
        )}
      >
        <ImagePlus className="size-4" />
        {label}
        <input
          ref={inputRef}
          name={name}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          onChange={handleChange}
          disabled={disabled || items.length >= maxFiles}
        />
      </label>

      {items.length > 0 && (
        <div className={cn("grid gap-3", mediaPickerGridClass[size])}>
          {items.map((item) => (
            <div
              key={item.id}
              className="group rounded-control border-subtle bg-surface-muted relative aspect-square overflow-hidden border"
            >
              {item.type === "video" ? (
                <video
                  src={item.previewUrl}
                  className="size-full object-cover"
                  muted
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt=""
                  className="size-full object-cover"
                />
              )}

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded-pill bg-overlay text-inverse hover:bg-danger absolute top-2 right-2 grid size-8 place-items-center opacity-100"
                aria-label={t.removeMedia}
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-muted text-xs">
        {t.mediaHelp.replace("{maxFiles}", String(maxFiles))}
      </p>
    </div>
  );
}
