import { LogoutButton } from "@/features/logout";

export function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LogoutButton />
      </div>
    </main>
  );
}
