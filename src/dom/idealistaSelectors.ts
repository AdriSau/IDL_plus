export interface ExtractionCandidate {
  name: string;
  source: 'selector' | 'json_ld' | 'meta' | 'text';
  value: string;
}

const TEXT_CONTAINER_SELECTORS = [
  'main',
  '#main-content',
  '[data-testid="ad-detail-page"]',
  'body'
];

const PRICE_SELECTORS = [
  '[data-testid="price"]',
  '.info-data-price',
  '.price-row span',
  'span[data-ad-price]',
  'meta[property="product:price:amount"]'
];

const POSTAL_CODE_SELECTORS = [
  '[data-testid="address"]',
  '.main-info__title-minor',
  '.main-info__title',
  'meta[property="og:title"]',
  'title'
];

const AREA_SELECTORS = [
  '[data-testid="features"] li',
  '.details-property_features li',
  '.details-property-h1-features li',
  '.info-features span',
  '.ad-comments-language-es'
];

export function collectPriceCandidates(rootDocument: Document): ExtractionCandidate[] {
  return [
    ...collectFromSelectors(rootDocument, PRICE_SELECTORS, 'price'),
    ...collectJsonLdCandidates(rootDocument, ['price'])
  ];
}

export function collectPostalCodeCandidates(rootDocument: Document): ExtractionCandidate[] {
  const selectorCandidates = collectFromSelectors(
    rootDocument,
    POSTAL_CODE_SELECTORS,
    'postal_code'
  );
  const jsonLdCandidates = collectJsonLdCandidates(rootDocument, [
    'postalCode',
    'addressLocality'
  ]);
  const visibleTextCandidate = collectVisibleTextCandidate(rootDocument, 'page_text');

  return [...selectorCandidates, ...jsonLdCandidates, ...visibleTextCandidate];
}

export function collectAreaCandidates(rootDocument: Document): ExtractionCandidate[] {
  const selectorCandidates = collectFromSelectors(rootDocument, AREA_SELECTORS, 'area');
  const jsonLdCandidates = collectJsonLdCandidates(rootDocument, ['floorSize', 'size']);
  const visibleTextCandidate = collectVisibleTextCandidate(rootDocument, 'page_text');

  return [...selectorCandidates, ...jsonLdCandidates, ...visibleTextCandidate];
}

function collectFromSelectors(
  rootDocument: Document,
  selectors: string[],
  fieldName: string
): ExtractionCandidate[] {
  const candidates: ExtractionCandidate[] = [];

  for (const selector of selectors) {
    const elements = rootDocument.querySelectorAll(selector);
    for (const element of elements) {
      const value = extractElementValue(element);
      if (!value) {
        continue;
      }

      candidates.push({
        name: `${fieldName}:${selector}`,
        source: selector.startsWith('meta[') ? 'meta' : 'selector',
        value
      });
    }
  }

  return dedupeCandidates(candidates);
}

function collectJsonLdCandidates(
  rootDocument: Document,
  keys: string[]
): ExtractionCandidate[] {
  const candidates: ExtractionCandidate[] = [];
  const scripts = rootDocument.querySelectorAll('script[type="application/ld+json"]');

  for (const script of scripts) {
    const content = script.textContent?.trim();
    if (!content) {
      continue;
    }

    const entries = safeParseJsonLd(content);
    for (const entry of entries) {
      for (const key of keys) {
        const value = findStringValue(entry, key);
        if (!value) {
          continue;
        }

        candidates.push({
          name: `json_ld:${key}`,
          source: 'json_ld',
          value
        });
      }
    }
  }

  return dedupeCandidates(candidates);
}

function collectVisibleTextCandidate(
  rootDocument: Document,
  name: string
): ExtractionCandidate[] {
  for (const selector of TEXT_CONTAINER_SELECTORS) {
    const element = rootDocument.querySelector(selector);
    const value = element?.textContent?.trim();

    if (!value) {
      continue;
    }

    return [
      {
        name,
        source: 'text',
        value
      }
    ];
  }

  return [];
}

function extractElementValue(element: Element): string | null {
  if (element instanceof HTMLMetaElement) {
    return element.content.trim() || null;
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value.trim() || null;
  }

  if (element instanceof HTMLLinkElement) {
    return element.href.trim() || null;
  }

  const dataAttributeValue =
    element.getAttribute('content') ??
    element.getAttribute('data-ad-price') ??
    element.getAttribute('data-adid');

  if (dataAttributeValue?.trim()) {
    return dataAttributeValue.trim();
  }

  return element.textContent?.trim() || null;
}

function safeParseJsonLd(content: string): unknown[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [parsed];
  } catch {
    return [];
  }
}

function findStringValue(input: unknown, targetKey: string): string | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const queue: unknown[] = [input];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') {
      continue;
    }

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    const entries = Object.entries(current as Record<string, unknown>);
    for (const [key, value] of entries) {
      if (key === targetKey && typeof value === 'string' && value.trim()) {
        return value.trim();
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return null;
}

function dedupeCandidates(candidates: ExtractionCandidate[]): ExtractionCandidate[] {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const key = `${candidate.source}:${candidate.name}:${candidate.value}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
