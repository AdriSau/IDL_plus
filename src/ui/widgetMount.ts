import { createLogger } from '../shared/logger';

const logger = createLogger('widget');

export function widgetMount(target: HTMLElement): void {
  if (!target.isConnected) {
    return;
  }

  // Placeholder intencional: la futura UI se montara aqui sin tocar el DOM todavia.
  logger.debug('widget mount placeholder ready');
}
