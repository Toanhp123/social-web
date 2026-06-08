import type { AppMessages } from "@/shared/i18n";
import {
  APP_FONT_SIZE_STEP,
  MAX_APP_FONT_SIZE,
  MIN_APP_FONT_SIZE,
  type AppFontSize,
} from "../model/app-settings";

type FontSizeSettingsSectionProps = {
  copy: AppMessages["settings"];
  fontSize: AppFontSize;
  onFontSizeChange: (fontSize: AppFontSize) => void;
};

export function FontSizeSettingsSection({
  copy,
  fontSize,
  onFontSizeChange,
}: FontSizeSettingsSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-primary text-sm font-medium">{copy.fontSize}</p>
        <span className="text-muted text-xs font-medium">
          {fontSize}px
        </span>
      </div>

      <div className="rounded-control border-subtle bg-surface-soft space-y-2 border px-3 py-3">
        <input
          type="range"
          min={MIN_APP_FONT_SIZE}
          max={MAX_APP_FONT_SIZE}
          step={APP_FONT_SIZE_STEP}
          value={fontSize}
          className="accent-brand w-full"
          aria-label={copy.fontSize}
          onChange={(event) => onFontSizeChange(Number(event.target.value))}
        />

        <div className="text-muted flex items-center justify-between text-xs">
          <span>{copy.fontSizeMin}</span>
          <span>{copy.fontSizeDefault}</span>
          <span>{copy.fontSizeMax}</span>
        </div>
      </div>
    </section>
  );
}
