import type {
  BootstrapContentResult,
  ContentLifecycleState,
  LifecycleTrigger,
  NavigationChangeEvent
} from '../core/types';
import { bootstrapContent } from './bootstrap';
import {
  observeNavigation,
  type NavigationObserverController
} from './navigationObserver';
import { createLogger } from '../shared/logger';
import { widgetUnmount } from '../ui/widgetMount';

const logger = createLogger('content:lifecycle');

export interface ContentLifecycleController {
  start(): void;
  dispose(): void;
  getState(): Readonly<ContentLifecycleState>;
}

export function createContentLifecycle(): ContentLifecycleController {
  const state: ContentLifecycleState = {
    lastProcessedKey: null,
    activePageContext: null,
    lastDetection: null
  };

  let navigationObserver: NavigationObserverController | null = null;
  let isDisposed = false;
  let runChain = Promise.resolve();

  const enqueueRun = (
    trigger: LifecycleTrigger,
    navigationEvent?: NavigationChangeEvent
  ): void => {
    runChain = runChain
      .then(() => runBootstrapCycle(trigger, navigationEvent))
      .catch((error: unknown) => {
        logger.error('lifecycle run failed', error);
      });
  };

  const runBootstrapCycle = async (
    trigger: LifecycleTrigger,
    navigationEvent?: NavigationChangeEvent
  ): Promise<void> => {
    if (isDisposed) {
      return;
    }

    const previousPageContext = state.activePageContext;
    const result: BootstrapContentResult = await bootstrapContent({
      previousPageContext
    });

    state.lastDetection = result.detection;

    const nextKey = buildProcessedKey(result);
    if (state.lastProcessedKey === nextKey) {
      logger.debug('skipping repeated page state', {
        trigger,
        status: result.detection.status
      });
      return;
    }

    state.lastProcessedKey = nextKey;

    if (previousPageContext && result.pageContext?.lifecycleKey !== previousPageContext.lifecycleKey) {
      widgetUnmount();
    }

    state.activePageContext = result.pageContext;

    logger.debug('page evaluated', {
      trigger,
      outcome: result.outcome,
      status: result.detection.status,
      reason: result.reason,
      navigationEvent
    });
  };

  return {
    start() {
      if (isDisposed || navigationObserver) {
        return;
      }

      enqueueRun('initial_load');
      navigationObserver = observeNavigation((event) => {
        enqueueRun(event.trigger, event);
      });
    },
    dispose() {
      isDisposed = true;
      navigationObserver?.dispose();
      navigationObserver = null;
      widgetUnmount();
    },
    getState() {
      return { ...state };
    }
  };
}

function buildProcessedKey(result: BootstrapContentResult): string {
  if (result.pageContext) {
    return `listing:${result.pageContext.lifecycleKey}`;
  }

  return `page:${result.detection.status}:${result.detection.url}`;
}
