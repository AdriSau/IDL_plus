import type {
  BootstrapContentInput,
  BootstrapContentResult,
  ListingPageContext
} from '../core/types';
import {
  createListingPageContext,
  detectIdealistaPage,
  isListingReadyDetection
} from '../dom/pageDetector';
import { extractListingData } from '../dom/extractListingData';
import { createLogger } from '../shared/logger';
import { widgetMount } from '../ui/widgetMount';

const logger = createLogger('content:bootstrap');

export async function bootstrapContent(
  input: BootstrapContentInput = {}
): Promise<BootstrapContentResult> {
  const detection = input.detection ?? detectIdealistaPage(window.location.href, document);

  if (!isListingReadyDetection(detection)) {
    logger.debug('skipping bootstrap for current page', {
      status: detection.status,
      reason: detection.reason
    });

    return {
      outcome: 'skipped',
      reason: detection.reason,
      detection,
      pageContext: null,
      extraction: null
    };
  }

  const pageContext = createListingPageContext(detection);
  if (isSamePageContext(input.previousPageContext, pageContext)) {
    logger.debug('bootstrap already applied for listing', {
      lifecycleKey: pageContext.lifecycleKey
    });

    return {
      outcome: 'skipped',
      reason: 'listing already bootstrapped',
      detection,
      pageContext,
      extraction: null
    };
  }

  const extraction = extractListingData(document);
  logger.debug('listing data extracted', {
    data: extraction.data,
    missingFields: extraction.missingFields,
    warnings: extraction.warnings
  });

  widgetMount(document.body, pageContext);

  return {
    outcome: 'mounted',
    reason: 'listing ready',
    detection,
    pageContext,
    extraction
  };
}

function isSamePageContext(
  previousPageContext: ListingPageContext | null | undefined,
  nextPageContext: ListingPageContext
): boolean {
  return previousPageContext?.lifecycleKey === nextPageContext.lifecycleKey;
}
