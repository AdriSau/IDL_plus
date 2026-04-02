import { bootstrapContent } from './bootstrap';
import { createLogger } from '../shared/logger';
import { isSupportedIdealistaPage } from '../dom/pageDetector';

const logger = createLogger('content');

function startContentScript(): void {
  if (!isSupportedIdealistaPage(window.location.href)) {
    return;
  }

  logger.info('content loaded');

  bootstrapContent().catch((error: unknown) => {
    logger.error('bootstrap failed', error);
  });
}

startContentScript();
