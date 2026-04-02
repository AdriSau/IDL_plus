import { isSupportedIdealistaPage } from '../dom/pageDetector';
import { widgetMount } from '../ui/widgetMount';

export async function bootstrapContent(): Promise<void> {
  if (!isSupportedIdealistaPage(window.location.href)) {
    return;
  }

  widgetMount(document.body);
}
