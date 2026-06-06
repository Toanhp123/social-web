type CreatePostTriggerProps = {
  isOpen: boolean;
  onOpen: () => void;
};

export function CreatePostTrigger({ isOpen, onOpen }: CreatePostTriggerProps) {
  return (
    <section className="rounded-2xl border border-white bg-white p-4 shadow-sm shadow-zinc-200/70">
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-blue-600 to-emerald-500 text-sm font-semibold text-white">
          SW
        </div>

        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="min-h-11 flex-1 rounded-full bg-zinc-100 px-4 text-left text-sm text-zinc-500 transition hover:bg-zinc-200"
        >
          Ban dang nghi gi?
        </button>
      </div>
    </section>
  );
}
