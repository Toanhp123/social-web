import { cn } from "@/shared/lib/utils";

const PROFILE_TABS = ["Bài viết", "Giới thiệu", "Bạn bè", "Ảnh"] as const;

export function ProfileTabs() {
  return (
    <nav className="flex gap-1 overflow-x-auto py-1 text-sm font-semibold text-zinc-600">
      {PROFILE_TABS.map((item) => {
        const isActive = item === "Bài viết";

        return (
          <button
            key={item}
            type="button"
            className={cn(
              "relative rounded-lg px-4 py-3 transition hover:bg-zinc-100",
              isActive && "text-blue-600",
            )}
          >
            {item}

            {isActive && (
              <span className="absolute inset-x-3 bottom-0 h-1 rounded-full bg-blue-600" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
