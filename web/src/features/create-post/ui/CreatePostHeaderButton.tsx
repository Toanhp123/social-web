"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SquarePen } from "lucide-react";
import { useCurrentSession } from "@/entities/session";
import { CALLBACK_URL_SEARCH_PARAM, ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { useCreatePostMutation } from "../model/use-create-post-mutation";
import { CreatePostDialog } from "./CreatePostDialog";

type CreatePostHeaderButtonProps = {
  className?: string;
};

export function CreatePostHeaderButton({
  className,
}: CreatePostHeaderButtonProps) {
  const t = useTranslations().createPost;
  const { currentUser } = useCurrentSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const createPostMutation = useCreatePostMutation({
    onCreated: () => {
      setFormKey((key) => key + 1);
      setIsOpen(false);
    },
  });

  const errorMessage =
    createPostMutation.error instanceof Error
      ? createPostMutation.error.message
      : "";

  function requireAuth() {
    const queryString = searchParams?.toString() ?? "";
    const callbackUrl = pathname
      ? queryString
        ? `${pathname}?${queryString}`
        : pathname
      : ROUTES.home;
    const authSearchParams = new URLSearchParams();

    authSearchParams.set(CALLBACK_URL_SEARCH_PARAM, callbackUrl);
    router.push(`${ROUTES.login}?${authSearchParams.toString()}`);
  }

  function handleOpen() {
    if (!currentUser) {
      requireAuth();
      return;
    }

    setIsOpen(true);
  }

  function handleClose() {
    if (createPostMutation.isPending) {
      return;
    }

    setIsOpen(false);
    setFormKey((key) => key + 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createPostMutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <>
      <button
        type="button"
        aria-label={t.title}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={handleOpen}
        className={className}
      >
        <SquarePen className="size-5" />
      </button>

      <CreatePostDialog
        open={isOpen}
        formKey={formKey}
        isSubmitting={createPostMutation.isPending}
        errorMessage={errorMessage}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </>
  );
}
