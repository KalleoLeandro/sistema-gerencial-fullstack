import { DOCUMENT } from '@angular/common';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { NavigationError } from '@angular/router';

export const RELOAD_NAVIGATION = new InjectionToken<(url: string) => void>('RELOAD_NAVIGATION', {
  providedIn: 'root',
  factory: () => {
    const location = inject(DOCUMENT).defaultView?.location;
    return (url) => location?.replace(url);
  }
});

@Injectable({ providedIn: 'root' })
export class ChunkLoadRecoveryService {
  private readonly document = inject(DOCUMENT);
  private readonly reload = inject(RELOAD_NAVIGATION);

  recover(event: NavigationError): void {
    const message = event.error instanceof Error ? event.error.message : String(event.error);
    if (!/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(message)) {
      return;
    }

    const view = this.document.defaultView;
    if (!view || !view.navigator.onLine) return;

    const destination = new URL(event.url, view.location.origin);
    if (destination.origin !== view.location.origin) return;

    const url = `${destination.pathname}${destination.search}${destination.hash}`;
    const key = `chunk-reload:${url}`;
    const now = Date.now();
    try {
      const previousAttempt = Number(view.sessionStorage.getItem(key));
      if (previousAttempt && now - previousAttempt < 60_000) return;
      view.sessionStorage.setItem(key, String(now));
    } catch {
      // Without a retry marker, automatic reloads could loop.
      return;
    }
    this.reload(url);
  }
}
