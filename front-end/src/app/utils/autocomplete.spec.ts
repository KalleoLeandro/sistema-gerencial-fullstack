import { TestBed } from '@angular/core/testing';
import { disableAutocompleteGlobal } from './autocomplete';

describe('disableAutocompleteGlobal', () => {
  it('disables autocomplete on existing and newly inserted fields', () => {
    const frame = spyOn(window, 'requestAnimationFrame').and.callFake(
      (callback) => {
        callback(0);
        return 1;
      },
    );
    let notify: MutationCallback | undefined;
    const observe = jasmine.createSpy();
    spyOn(window, 'MutationObserver').and.callFake(function (
      callback: MutationCallback,
    ) {
      notify = callback;
      return { observe } as any;
    });
    const host = document.createElement('div');
    host.innerHTML =
      '<form><input><textarea></textarea><select></select></form>';
    document.body.append(host);
    try {
      TestBed.runInInjectionContext(disableAutocompleteGlobal());
      expect(frame).toHaveBeenCalled();
      expect(host.querySelector('input')!.getAttribute('autocomplete')).toBe(
        'off',
      );
      const input = document.createElement('input');
      const nested = document.createElement('div');
      nested.innerHTML = '<textarea></textarea>';
      notify!(
        [
          { addedNodes: [input, nested, document.createTextNode('text')] },
        ] as any,
        {} as any,
      );
      expect(input.getAttribute('autocomplete')).toBe('off');
      expect(
        nested.querySelector('textarea')!.getAttribute('autocomplete'),
      ).toBe('off');
      expect(observe).toHaveBeenCalledWith(document.body, {
        childList: true,
        subtree: true,
      });
    } finally {
      host.remove();
    }
  });
});
