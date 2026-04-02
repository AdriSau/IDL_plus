const IDEALISTA_HOSTS = new Set([
  'www.idealista.com',
  'www.idealista.it',
  'www.idealista.pt'
]);

export function isSupportedIdealistaPage(urlLike: string | URL): boolean {
  try {
    const url = typeof urlLike === 'string' ? new URL(urlLike) : urlLike;
    return IDEALISTA_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
