"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Globe2, Lock, SendHorizonal, Users } from "lucide-react";
import { PostCard, type Post } from "@/entities/post";
import { Button, Combobox, MediaPicker, type ComboboxOption } from "@/shared/ui";
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
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Tao bai viet</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Dang text kem nhieu anh hoac video.
        </p>
      </div>

      <form key={formKey} onSubmit={handleSubmit} className="space-y-5">
        <textarea
          name="content"
          rows={4}
          maxLength={5000}
          placeholder="Ban dang nghi gi?"
          className="min-h-28 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
        />

        <div className="max-w-sm">
          <Combobox
            name="visibility"
            label="Hien thi"
            defaultValue="PUBLIC"
            size="md"
            variant="detailed"
            options={VISIBILITY_OPTIONS}
          />
        </div>

        <MediaPicker name="media" label="Them anh/video" maxFiles={10} />

        {errorMessage && (
          <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          disabled={createPostMutation.isPending}
          className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <SendHorizonal className="size-4" />
          {createPostMutation.isPending ? "Dang dang..." : "Dang bai"}
        </Button>
      </form>

      {createdPost && (
        <PostCard post={createdPost} className="mt-6" metaLabel="Vua dang" />
      )}
    </section>
  );
}
