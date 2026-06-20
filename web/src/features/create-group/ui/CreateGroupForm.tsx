"use client";

import type { FormEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { useCreateGroupMutation } from "../model/use-create-group-mutation";

export function CreateGroupForm() {
  const createGroupMutation = useCreateGroupMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createGroupMutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border-surface-border bg-surface-elevated shadow-card space-y-4 border p-4"
    >
      <div>
        <label className="text-primary text-sm font-medium" htmlFor="group-name">
          Group name
        </label>
        <Input id="group-name" name="name" placeholder="React Vietnam" />
      </div>

      <div>
        <label
          className="text-primary text-sm font-medium"
          htmlFor="group-description"
        >
          Description
        </label>
        <textarea
          id="group-description"
          name="description"
          rows={4}
          className="rounded-control border-subtle bg-surface-soft text-primary placeholder:text-placeholder focus:border-brand mt-2 w-full resize-none border px-4 py-3 text-sm outline-none"
          placeholder="What is this group about?"
        />
      </div>

      <div>
        <label className="text-primary text-sm font-medium" htmlFor="privacy">
          Privacy
        </label>
        <select
          id="privacy"
          name="privacy"
          defaultValue="PUBLIC"
          className="rounded-control border-subtle bg-surface-soft text-primary focus:border-brand mt-2 h-11 w-full border px-3 text-sm outline-none"
        >
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>
      </div>

      {createGroupMutation.error instanceof Error && (
        <p className="rounded-card bg-danger-soft text-danger px-3 py-2 text-sm">
          {createGroupMutation.error.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={createGroupMutation.isPending}
        className="inline-flex items-center justify-center gap-2"
      >
        <SendHorizontal className="size-4" />
        {createGroupMutation.isPending ? "Creating..." : "Create group"}
      </Button>
    </form>
  );
}
