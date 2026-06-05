"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import {
  Globe2,
  ImagePlus,
  Lock,
  SendHorizonal,
  Smile,
  Users,
} from "lucide-react";
import { PostCard, type Post } from "@/entities/post";
import {
  Button,
  Combobox,
  MediaPicker,
  type ComboboxOption,
} from "@/shared/ui";
import { useCreatePostMutation } from "../model/use-create-post-mutation";

const VISIBILITY_OPTIONS: ComboboxOption[] = [
  {
    value: "PUBLIC",
    label: "Cong khai",
    description: "Moi nguoi co the xem bai viet.",
    icon: <Globe2 className="size-4" />,
  },
  {
    value: "FRIENDS_ONLY",
    label: "Ban be",
    description: "Chi ban be cua ban co the xem.",
    icon: <Users className="size-4" />,
  },
  {
    value: "PRIVATE",
    label: "Rieng tu",
    description: "Chi minh ban co the xem.",
    icon: <Lock className="size-4" />,
  },
];

export function CreatePostComposer() {
  const [createdPost, setCreatedPost] = useState<Post | null>(null);
  const [formKey, setFormKey] = useState(0);
  const createPostMutation = useCreatePostMutation({
    onCreated: (post) => {
      setCreatedPost(post);
      setFormKey((key) => key + 1);
    },
  });
  const errorMessage =
    createPostMutation.error instanceof Error
      ? createPostMutation.error.message
      : "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createPostMutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <section className="rounded-2xl border border-white bg-white p-4 shadow-sm shadow-zinc-200/70 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-blue-600 to-emerald-500 text-sm font-semibold text-white">
          SW
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-zinc-950">
            Tao bai viet
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Noi dieu ban muon chia se voi moi nguoi.
          </p>
        </div>
      </div>

      <form key={formKey} onSubmit={handleSubmit} className="space-y-5">
        <textarea
          name="content"
          rows={4}
          maxLength={5000}
          placeholder="Ban dang nghi gi?"
          className="min-h-28 w-full resize-y rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white"
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
          <MediaPicker name="media" label="Them anh/video" maxFiles={10} />
          <div className="space-y-3">
            <Combobox
              name="visibility"
              label="Hien thi"
              defaultValue="PUBLIC"
              size="md"
              variant="detailed"
              options={VISIBILITY_OPTIONS}
            />
            <div className="flex gap-2">
              <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
                <ImagePlus className="size-4 text-emerald-600" />
                Media
              </span>
              <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
                <Smile className="size-4 text-amber-500" />
                Cam xuc
              </span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Anh/video toi da 10 file. Noi dung toi da 5000 ky tu.
          </p>
          <Button
            type="submit"
            disabled={createPostMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 sm:w-auto"
          >
            <SendHorizonal className="size-4" />
            {createPostMutation.isPending ? "Dang dang..." : "Dang bai"}
          </Button>
        </div>
      </form>

      {createdPost && (
        <PostCard post={createdPost} className="mt-6" metaLabel="Vua dang" />
      )}
    </section>
  );
}
