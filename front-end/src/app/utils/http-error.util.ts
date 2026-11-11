export function getHttpErrorMessage(error: any, fallback: string): string {
  const message =
    error?.error?.message ||
    error?.error?.error ||
    error?.error?.details ||
    error?.message;

  return typeof message === 'string' && message.trim() ? message : fallback;
}
