import { AeroDetailsComponent } from '../index';

describe('AeroDetailsComponent', () => {
  it('emits expansion changes', () => {
    const details: any = new AeroDetailsComponent();
    const changed = jasmine.createSpy();
    details.expandedChange.subscribe(changed);
    details.toggle({ target: { open: true } });
    expect(changed).toHaveBeenCalledWith(true);
  });
});
