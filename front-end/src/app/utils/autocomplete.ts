import { inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export function disableAutocompleteGlobal() {
  return () => {
    const document = inject(DOCUMENT);

    requestAnimationFrame(() => {
      const apply = (el: Element) => el.setAttribute('autocomplete', 'off');

      document.querySelectorAll('form, input, textarea, select')
              .forEach(apply);

      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node instanceof HTMLElement) {
              if (['FORM','INPUT','TEXTAREA','SELECT'].includes(node.tagName)) {
                apply(node);
              }
              node.querySelectorAll?.('form, input, textarea, select')
                  .forEach(apply);
            }
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    });
  };
}
