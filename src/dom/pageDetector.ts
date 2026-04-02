import type {
  IdealistaPageDetection,
  ListingPageContext,
  PageDetectionSignal
} from '../core/types';

const IDEALISTA_HOSTS = new Set([
  'www.idealista.com',
  'www.idealista.it',
  'www.idealista.pt'
]);

const LISTING_PATH_PATTERNS = [
  /\/inmueble\/(\d+)/i,
  /\/immobile\/(\d+)/i,
  /\/imovel\/(\d+)/i
];

const LISTING_PATH_HINTS = ['/inmueble/', '/immobile/', '/imovel/'];

const DOM_SIGNAL_SELECTORS: Array<{
  selector: string;
  name: string;
}> = [
  { selector: 'main', name: 'main_present' },
  { selector: 'link[rel="canonical"]', name: 'canonical_link' },
  { selector: 'meta[property="og:url"]', name: 'og_url_meta' },
  { selector: '[data-adid]', name: 'data_adid' },
  { selector: '[class*="detail"]', name: 'detail_class_hint' }
];

export function isSupportedIdealistaPage(urlLike: string | URL): boolean {
  try {
    const url = typeof urlLike === 'string' ? new URL(urlLike) : urlLike;
    return IDEALISTA_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function detectIdealistaPage(
  urlLike: string | URL,
  rootDocument: Document = document
): IdealistaPageDetection {
  const url = safeCreateUrl(urlLike);
  if (!url || !IDEALISTA_HOSTS.has(url.hostname)) {
    return {
      status: 'unsupported',
      url: typeof urlLike === 'string' ? urlLike : urlLike.toString(),
      hostname: url?.hostname ?? '',
      pathname: url?.pathname ?? '',
      listingId: null,
      reason: 'host not supported',
      signals: []
    };
  }

  const signals: PageDetectionSignal[] = [];
  const listingIdFromUrl = extractListingIdFromPath(url.pathname);
  const hasListingPathHint = LISTING_PATH_HINTS.some((segment) =>
    url.pathname.toLowerCase().includes(segment)
  );

  if (hasListingPathHint) {
    signals.push({ source: 'url', name: 'listing_path_hint' });
  }

  if (listingIdFromUrl) {
    signals.push({ source: 'url', name: 'listing_id_in_path' });
  }

  const domSignals = collectDomSignals(rootDocument);
  signals.push(...domSignals.signals);

  const listingId = listingIdFromUrl ?? domSignals.listingId;
  const domListingEvidenceCount = domSignals.signals.filter(
    (signal) => signal.name !== 'main_present'
  ).length;

  if (!hasListingPathHint && domListingEvidenceCount === 0) {
    return {
      status: 'supported_non_listing',
      url: url.toString(),
      hostname: url.hostname,
      pathname: url.pathname,
      listingId: null,
      reason: 'supported idealista page without listing signals',
      signals
    };
  }

  if (!listingId || domListingEvidenceCount === 0) {
    return {
      status: 'listing_candidate',
      url: url.toString(),
      hostname: url.hostname,
      pathname: url.pathname,
      listingId,
      reason: 'listing-like page pending stronger confirmation',
      signals
    };
  }

  return {
    status: 'listing_ready',
    url: url.toString(),
    hostname: url.hostname,
    pathname: url.pathname,
    listingId,
    reason: 'listing URL and DOM signals confirmed',
    signals
  };
}

export function isListingReadyDetection(
  detection: IdealistaPageDetection
): detection is IdealistaPageDetection & { status: 'listing_ready' } {
  return detection.status === 'listing_ready';
}

export function createListingPageContext(
  detection: IdealistaPageDetection & {
    status: 'listing_candidate' | 'listing_ready';
  }
): ListingPageContext {
  const lifecycleIdentity =
    detection.listingId ?? `${detection.hostname}${detection.pathname}`;

  return {
    lifecycleKey: lifecycleIdentity,
    url: detection.url,
    pathname: detection.pathname,
    hostname: detection.hostname,
    listingId: detection.listingId,
    detectedAt: Date.now(),
    detectionStatus: detection.status
  };
}

function collectDomSignals(rootDocument: Document): {
  signals: PageDetectionSignal[];
  listingId: string | null;
} {
  const signals: PageDetectionSignal[] = [];

  for (const definition of DOM_SIGNAL_SELECTORS) {
    const element = rootDocument.querySelector(definition.selector);
    if (!element) {
      continue;
    }

    if (definition.name === 'canonical_link' && element instanceof HTMLLinkElement) {
      if (!containsListingPath(element.href)) {
        continue;
      }
    }

    if (
      definition.name === 'og_url_meta' &&
      element instanceof HTMLMetaElement &&
      !containsListingPath(element.content)
    ) {
      continue;
    }

    signals.push({ source: 'dom', name: definition.name });
  }

  const dataAdElement = rootDocument.querySelector<HTMLElement>('[data-adid]');
  const listingId = dataAdElement?.dataset.adid ?? null;

  return {
    signals,
    listingId
  };
}

function containsListingPath(value: string): boolean {
  return LISTING_PATH_HINTS.some((segment) => value.toLowerCase().includes(segment));
}

function extractListingIdFromPath(pathname: string): string | null {
  for (const pattern of LISTING_PATH_PATTERNS) {
    const match = pathname.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function safeCreateUrl(urlLike: string | URL): URL | null {
  try {
    return typeof urlLike === 'string' ? new URL(urlLike) : urlLike;
  } catch {
    return null;
  }
}
