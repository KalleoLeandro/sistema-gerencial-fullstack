import { DesignSystemComponent } from './design-system.component';

describe('DesignSystemComponent', () => {
  it('validates the demo form', () => {
    const demo: any = new DesignSystemComponent();
    demo.save();
    expect(demo.notice()).toContain('Confira');
    demo.form.patchValue({ name: 'Ana' });
    demo.save();
    expect(demo.notice()).toContain('sucesso');
  });
});
