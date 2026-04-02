import { createLogger } from '../shared/logger';
import type { ListingPageContext } from '../core/types';

const logger = createLogger('widget');

let mountedLifecycleKey: string | null = null;

export function widgetMount(
  target: HTMLElement,
  pageContext: ListingPageContext
): void {
  if (!target.isConnected) {
    return;
  }

  if (mountedLifecycleKey === pageContext.lifecycleKey) {
    logger.debug('widget already mounted for listing', {
      lifecycleKey: pageContext.lifecycleKey
    });
    return;
  }

  mountedLifecycleKey = pageContext.lifecycleKey;

  // Placeholder intencional: la futura UI se montara aqui sin tocar el DOM todavia.
  logger.debug('widget mount placeholder ready', {
    lifecycleKey: pageContext.lifecycleKey
  });
}

export function widgetUnmount(): void {
  if (!mountedLifecycleKey) {
    return;
  }

  logger.debug('widget unmount placeholder ready', {
    lifecycleKey: mountedLifecycleKey
  });
  mountedLifecycleKey = null;
}
