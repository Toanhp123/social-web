"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

export type PickedMediaFile = {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
};

type MediaPickerProps = {
  name: string;
  label: string;
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
  onFilesChange?: (files: File[]) => void;
};

const DEFAULT_MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime";

export function MediaPicker({
  name,
  label,
  accept = DEFAULT_MEDIA_ACCEPT,
  maxFiles = 10,
  disabled,
  onFilesChange,
}: MediaPickerProps) {
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
        className={[
          "inline-flex cursor-pointer items-center gap-2 rounded-xl",
          "border border-zinc-200 bg-zinc-50 px-4 py-2",
          "text-sm font-medium text-zinc-700 hover:border-blue-400 hover:bg-white",
          disabled || items.length >= maxFiles
            ? "pointer-events-none opacity-60"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
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
                className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-zinc-950/80 text-white opacity-100 hover:bg-red-600"
                aria-label="Remove media"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Toi da {maxFiles} file. Ho tro JPG, PNG, WEBP, MP4, WEBM, MOV.
      </p>
    </div>
  );
}
