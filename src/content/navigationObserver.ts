import type {
  LifecycleTrigger,
  NavigationChangeEvent
} from '../core/types';

type NavigationListener = (event: NavigationChangeEvent) => void;

export interface NavigationObserverController {
  dispose(): void;
}

export function observeNavigation(
  listener: NavigationListener
): NavigationObserverController {
  let currentUrl = window.location.href;

  const notifyIfChanged = (trigger: LifecycleTrigger): void => {
    const nextUrl = window.location.href;

    if (nextUrl === currentUrl) {
      return;
    }

    const event: NavigationChangeEvent = {
      trigger,
      previousUrl: currentUrl,
      currentUrl: nextUrl
    };

    currentUrl = nextUrl;
    listener(event);
  };

  const restorePushState = patchHistoryMethod('pushState', () => {
    notifyIfChanged('history_push');
  });
  const restoreReplaceState = patchHistoryMethod('replaceState', () => {
    notifyIfChanged('history_replace');
  });

  const handlePopState = (): void => notifyIfChanged('popstate');
  const handleHashChange = (): void => notifyIfChanged('hashchange');

  window.addEventListener('popstate', handlePopState);
  window.addEventListener('hashchange', handleHashChange);

  const mutationObserver = new MutationObserver(() => {
    notifyIfChanged('dom_mutation');
  });

  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  return {
    dispose() {
      restorePushState();
      restoreReplaceState();
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
      mutationObserver.disconnect();
    }
  };
}

function patchHistoryMethod(
  methodName: 'pushState' | 'replaceState',
  onAfterCall: () => void
): () => void {
  const originalMethod = window.history[methodName];

  window.history[methodName] = function patchedHistoryMethod(
    ...args: Parameters<History['pushState']>
  ): void {
    originalMethod.apply(window.history, args);
    onAfterCall();
  };

  return () => {
    window.history[methodName] = originalMethod;
  };
}
