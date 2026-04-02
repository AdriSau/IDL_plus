export function noop(): void {
  // Utilidad base para futuras extensiones de comportamiento opcional.
}

export function safeParseUrl(urlLike: string): URL | null {
  try {
    return new URL(urlLike);
  } catch {
    return null;
  }
}
