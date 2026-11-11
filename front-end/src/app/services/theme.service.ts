import { DOCUMENT } from '@angular/common';
import { Injectable, OnDestroy, inject, signal } from '@angular/core';

export type AeroTheme = 'light' | 'dark';
const STORAGE_KEY = 'aero-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly media = this.window?.matchMedia?.('(prefers-color-scheme: dark)');
  private preference: AeroTheme | null = this.readPreference();
  readonly theme = signal<AeroTheme>(this.preference ?? (this.media?.matches ? 'dark' : 'light'));

  constructor() {
    this.apply();
    this.media?.addEventListener('change', this.onSystemChange);
    this.window?.addEventListener('storage', this.onStorageChange);
  }
  toggle(): void { this.setTheme(this.theme() === 'dark' ? 'light' : 'dark'); }
  setTheme(theme: AeroTheme): void {
    this.preference = theme;
    this.theme.set(theme);
    try { this.window?.localStorage.setItem(STORAGE_KEY, theme); } catch { /* Theme still works without storage. */ }
    this.apply();
  }
  private readPreference(): AeroTheme | null {
    try {
      const value = this.window?.localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch { return null; }
  }
  private apply(): void {
    this.document.documentElement.dataset['theme'] = this.theme();
    this.document.documentElement.dataset['bsTheme'] = this.theme();
  }
  private readonly onSystemChange = (): void => {
    if (!this.preference) {
      this.theme.set(this.media?.matches ? 'dark' : 'light');
      this.apply();
    }
  };
  private readonly onStorageChange = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    this.preference = this.readPreference();
    this.theme.set(this.preference ?? (this.media?.matches ? 'dark' : 'light'));
    this.apply();
  };
  ngOnDestroy(): void {
    this.media?.removeEventListener('change', this.onSystemChange);
    this.window?.removeEventListener('storage', this.onStorageChange);
  }
}
