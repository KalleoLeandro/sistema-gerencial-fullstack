import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let stored: string | null;
  let root: HTMLElement;
  let media: { matches: boolean; addEventListener: jasmine.Spy; removeEventListener: jasmine.Spy };
  let browser: { localStorage: { getItem: jasmine.Spy; setItem: jasmine.Spy }; matchMedia: jasmine.Spy; addEventListener: jasmine.Spy; removeEventListener: jasmine.Spy };

  beforeEach(() => {
    stored = null;
    root = document.createElement('html');
    media = { matches: true, addEventListener: jasmine.createSpy(), removeEventListener: jasmine.createSpy() };
    browser = {
      localStorage: { getItem: jasmine.createSpy().and.callFake(() => stored), setItem: jasmine.createSpy().and.callFake((_key: string, value: string) => stored = value) },
      matchMedia: jasmine.createSpy().and.returnValue(media), addEventListener: jasmine.createSpy(), removeEventListener: jasmine.createSpy(),
    };
    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: { documentElement: root, defaultView: browser } }] });
  });
  it('follows system changes until the user chooses a theme', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('dark');
    const change = media.addEventListener.calls.first().args[1];
    media.matches = false; change();
    expect(root.dataset['theme']).toBe('light');
    service.setTheme('dark'); change();
    expect(root.dataset['theme']).toBe('dark');
    expect(root.dataset['bsTheme']).toBe('dark');
  });
  it('restores the saved preference and persists toggles', () => {
    stored = 'light';
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
    service.toggle();
    expect(stored).toBe('dark');
    expect(root.dataset['theme']).toBe('dark');
  });
  it('keeps working when storage is blocked', () => {
    browser.localStorage.getItem.and.throwError('blocked');
    browser.localStorage.setItem.and.throwError('blocked');
    const service = TestBed.inject(ThemeService);
    expect(() => service.toggle()).not.toThrow();
    expect(root.dataset['theme']).toBe('light');
  });
  it('synchronizes other tabs and removes listeners on teardown', () => {
    const service = TestBed.inject(ThemeService);
    stored = 'light';
    browser.addEventListener.calls.first().args[1]({ key: 'aero-theme' });
    expect(service.theme()).toBe('light');
    service.ngOnDestroy();
    expect(media.removeEventListener).toHaveBeenCalled();
    expect(browser.removeEventListener).toHaveBeenCalled();
  });
});
