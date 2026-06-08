import { Globe2, Lock, Users } from "lucide-react";
import { useTranslations } from "@/shared/i18n";
import type { ComboboxOption } from "@/shared/ui";

export function useVisibilityOptions(): ComboboxOption[] {
  const t = useTranslations().createPost.visibility;

  return [
    {
      value: "PUBLIC",
      label: t.public,
      description: t.publicDescription,
      icon: <Globe2 className="size-4" />,
    },
    {
      value: "FRIENDS_ONLY",
      label: t.friends,
      description: t.friendsDescription,
      icon: <Users className="size-4" />,
    },
    {
      value: "PRIVATE",
      label: t.private,
      description: t.privateDescription,
      icon: <Lock className="size-4" />,
    },
  ];
}

