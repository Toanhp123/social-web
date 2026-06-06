import type { ReactNode } from "react";
import { Globe2, ImagePlus, Smile } from "lucide-react";

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

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 sm:grid-cols-3">
        <ComposerAction
          icon={<ImagePlus className="size-5 text-emerald-600" />}
          label="Anh/video"
          onClick={onOpen}
        />

        <ComposerAction
          icon={<Smile className="size-5 text-amber-500" />}
          label="Cam xuc"
          onClick={onOpen}
        />

        <ComposerAction
          icon={<Globe2 className="size-5 text-blue-600" />}
          label="Hien thi"
          onClick={onOpen}
          className="col-span-2 sm:col-span-1"
        />
      </div>
    </section>
  );
}

type ComposerActionProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
};

function ComposerAction({
  icon,
  label,
  onClick,
  className,
}: ComposerActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}
