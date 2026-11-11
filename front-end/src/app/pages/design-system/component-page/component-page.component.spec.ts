import { ComponentPageComponent } from './component-page.component';
import { AERO_USAGE_DOCS } from '../docs/aero-usage.data';
import { pageSetup } from '../../../testing/page.testing';

describe('ComponentPageComponent', () => {
  it('loads component metadata', () => {
    const setup = pageSetup({}, {}, { componentId: AERO_USAGE_DOCS[0].id });
    const page: any = setup.create(ComponentPageComponent);
    expect(page.doc.id).toBe(AERO_USAGE_DOCS[0].id);
  });
});
