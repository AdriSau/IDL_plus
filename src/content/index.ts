import { createLogger } from '../shared/logger';
import { createContentLifecycle } from './pageLifecycle';

const logger = createLogger('content');

function startContentScript(): void {
  logger.info('content loaded');
  const lifecycle = createContentLifecycle();
  lifecycle.start();
}

startContentScript();
