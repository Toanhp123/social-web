import { BellDot, Sparkles, UsersRound } from "lucide-react";

type HomeRailProps = {
  currentUserEmail?: string;
};

export function HomeRail({ currentUserEmail }: HomeRailProps) {
  const items = [
    { icon: BellDot, label: "Thông báo mới", meta: "Theo dõi các cập nhật" },
    { icon: UsersRound, label: "Cộng đồng", meta: "Khám phá chủ đề yêu thích" },
    { icon: Sparkles, label: "Nổi bật", meta: "Bài viết được quan tâm" },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-card border border-surface bg-surface p-4 shadow-card">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">
          {currentUserEmail ? "Xin chào" : "Social Web"}
        </p>

        <h2 className="mt-2 text-lg font-semibold break-all text-primary">
          {currentUserEmail ?? "Bảng tin công khai"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted">
          {currentUserEmail
            ? "Chọn một luồng cập nhật, viết bài mới hoặc chăm lại profile."
            : "Bạn có thể đọc feed trước, đăng nhập khi muốn tương tác."}
        </p>
      </section>

      <section className="rounded-card border border-surface bg-surface p-3 shadow-card">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex w-full items-center gap-3 rounded-control px-3 py-3"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-control bg-surface-muted text-secondary">
                  <Icon className="size-5" />
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-medium text-primary">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {item.meta}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
