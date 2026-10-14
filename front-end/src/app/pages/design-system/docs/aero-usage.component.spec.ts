import { AeroUsageComponent } from './aero-usage.component';
import { AERO_USAGE_DOCS } from './aero-usage.data';

describe('AeroUsageComponent', () => {
  it('switches docs and handles successful/failed copying', async () => {
    const copy = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    const docs: any = new AeroUsageComponent();
    docs.documentation = AERO_USAGE_DOCS[1];
    expect(docs.selected()).toBe(AERO_USAGE_DOCS[1]);
    docs.documentation = null;
    expect(docs.fixedComponent).toBeFalse();
    docs.selectComponent({ target: { value: AERO_USAGE_DOCS[0].id } });
    expect(docs.selected()).toBe(AERO_USAGE_DOCS[0]);
    docs.selectComponent({ target: { value: 'missing' } });
    await docs.copyCode('example', 'HTML');
    expect(copy).toHaveBeenCalledWith('example');
    expect(docs.copyStatus()).toContain('copiado');
    copy.and.rejectWith(new Error('denied'));
    await docs.copyCode('example', 'HTML');
    expect(docs.copyStatus()).toContain('manualmente');
  });
});
