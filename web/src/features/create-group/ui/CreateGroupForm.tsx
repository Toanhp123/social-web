"use client";

import type { FormEvent } from "react";
import { Globe2, Lock, SendHorizontal } from "lucide-react";
import { useTranslations } from "@/shared/i18n";
import { Button, Card, Combobox, Input, Textarea } from "@/shared/ui";
import { useCreateGroupMutation } from "../model/use-create-group-mutation";

type CreateGroupFormProps = {
  idPrefix?: string;
};

export function CreateGroupForm({ idPrefix = "group" }: CreateGroupFormProps) {
  const t = useTranslations().groups;
  const createGroupMutation = useCreateGroupMutation();
  const nameId = `${idPrefix}-name`;
  const descriptionId = `${idPrefix}-description`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createGroupMutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <Card variant="elevated" className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-primary text-sm font-medium" htmlFor={nameId}>
          {t.form.name}
        </label>
        <Input id={nameId} name="name" placeholder={t.form.namePlaceholder} />
      </div>

      <div>
        <label
          className="text-primary text-sm font-medium"
          htmlFor={descriptionId}
        >
          {t.form.description}
        </label>
        <Textarea
          id={descriptionId}
          name="description"
          rows={4}
          size="lg"
          className="mt-2"
          placeholder={t.form.descriptionPlaceholder}
        />
      </div>

      <Combobox
          name="privacy"
          label={t.form.privacy}
          defaultValue="PUBLIC"
          variant="detailed"
          size="md"
          options={[
            {
              value: "PUBLIC",
              label: t.public,
              description: t.form.publicDescription,
              icon: <Globe2 className="size-4" />,
            },
            {
              value: "PRIVATE",
              label: t.private,
              description: t.form.privateDescription,
              icon: <Lock className="size-4" />,
            },
          ]}
        />

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
        {createGroupMutation.isPending ? t.form.creating : t.form.submit}
      </Button>
      </form>
    </Card>
  );
}
