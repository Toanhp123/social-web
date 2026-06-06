import { Globe2, Lock, Users } from "lucide-react";
import type { ComboboxOption } from "@/shared/ui";

export const VISIBILITY_OPTIONS: ComboboxOption[] = [
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
