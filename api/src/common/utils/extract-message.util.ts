export function extractMessage(input: unknown): string | null {
  if (
    typeof input === 'object' &&
    input !== null &&
    'message' in input &&
    typeof (input as Record<string, unknown>).message === 'string'
  ) {
    return (input as { message: string }).message;
  }

  return null;
}
