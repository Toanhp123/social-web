export function safeStringify(value: unknown, space?: number): string {
  const seen = new WeakSet<object>();

  return (
    JSON.stringify(
      value,
      (_key, item: unknown) => {
        if (typeof item === 'bigint') {
          return item.toString();
        }

        if (item && typeof item === 'object') {
          if (seen.has(item)) {
            return '[Circular]';
          }
          seen.add(item);
        }

        return item;
      },
      space,
    ) ?? String(value)
  );
}
