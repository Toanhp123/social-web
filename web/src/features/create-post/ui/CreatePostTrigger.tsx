type CreatePostTriggerProps = {
  isOpen: boolean;
  onOpen: () => void;
};

export function CreatePostTrigger({ isOpen, onOpen }: CreatePostTriggerProps) {
  return (
    <section className="rounded-card border border-surface bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-pill bg-brand-gradient text-sm font-semibold text-inverse">
          SW
        </div>

        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="min-h-11 flex-1 rounded-pill bg-surface-muted px-4 text-left text-sm text-muted transition hover:bg-surface-muted"
        >
          Ban dang nghi gi?
        </button>
      </div>
    </section>
  );
}
