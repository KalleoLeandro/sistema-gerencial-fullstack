import { AERO_USAGE_DOCS } from '../../pages/design-system/docs/aero-usage.data';
import { DesignSystemLayoutComponent } from './design-system-layout.component';

describe('DesignSystemLayoutComponent', () => {
  it('exposes the component catalogue', () => {
    expect((new DesignSystemLayoutComponent() as any).components).toBe(
      AERO_USAGE_DOCS,
    );
  });
});
