import { CalendarDays, Globe, MapPin } from "lucide-react";
import type { UserProfile } from "@/entities/user";
import type { ProfileMetaItem } from "../model/types";
import { formatDate } from "./format-date";
import { normalizeWebsiteUrl } from "./normalize-website-url";

export function buildProfileMetaItems(
  profile: UserProfile | null,
): ProfileMetaItem[] {
  const websiteUrl = profile?.website
    ? normalizeWebsiteUrl(profile.website)
    : null;

  return [
    profile?.locationName
      ? {
          icon: MapPin,
          label: profile.locationName,
        }
      : null,
    profile?.website
      ? {
          icon: Globe,
          label: profile.website,
          href: websiteUrl ?? undefined,
        }
      : null,
    profile?.birthday
      ? {
          icon: CalendarDays,
          label: formatDate(profile.birthday),
        }
      : null,
  ].filter((item): item is ProfileMetaItem => item !== null);
}
