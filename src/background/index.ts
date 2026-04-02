import { createLogger } from '../shared/logger';

const logger = createLogger('background');

function startBackground(): void {
  logger.debug('service worker ready');
}

startBackground();
