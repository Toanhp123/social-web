# Web Theme Rules

All visual styling must use theme tokens exposed from `app/globals.css` through `@theme inline`.

Use these token classes by default:

- Backgrounds: `bg-app`, `bg-surface`, `bg-surface-elevated`, `bg-surface-soft`, `bg-surface-muted`, `bg-surface-inverse`.
- Text: `text-primary`, `text-secondary`, `text-muted`, `text-placeholder`, `text-inverse`.
- Borders: `border-subtle`, `border-soft`, `border-surface-border`, `border-brand-border`, `border-danger-border`.
- Brand and states: `bg-brand`, `bg-brand-soft`, `text-brand`, `text-brand-strong`, `bg-success-soft`, `text-success`, `bg-danger-soft`, `text-danger`.
- Radius: `rounded-card` for cards, `rounded-panel` for dialogs/large panels, `rounded-control` for inputs/buttons, `rounded-pill` for pills. Use `rounded-full` only for true circles such as avatars and badges.
- Shadows: `shadow-card` for cards, `shadow-control` for small buttons/controls, `shadow-popover` for floating overlays.

Do not use raw Tailwind palette classes such as `bg-zinc-*`, `text-emerald-*`, `border-gray-*`, `shadow-sm`, `rounded-lg`, or hardcoded gradients in components. If a new semantic color is needed, add a CSS variable in `:root`, a dark-mode value in `[data-theme="dark"]`, and expose it in `@theme inline`.

Avoid putting design tokens in `@layer utilities`. Utility-only classes do not behave like normal theme tokens across variants such as `hover:*`, `focus:*`, and responsive states. Use `@theme inline` for colors, radius, and shadows. Keep `@layer utilities` only for non-token helpers such as `bg-brand-gradient`.

Feature-specific semantic colors are allowed when the feature needs meaning that generic brand/danger/success cannot express. Reactions are the current example: use `bg-reaction-love-soft`, `text-reaction-love`, and the matching reaction tokens instead of raw `rose`, `amber`, `violet`, or `sky` classes.

When reviewing UI, first scan for raw palette/radius/shadow classes and replace them with theme tokens before changing component layout.
