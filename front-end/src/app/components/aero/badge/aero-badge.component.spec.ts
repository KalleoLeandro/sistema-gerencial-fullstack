import { TestBed } from '@angular/core/testing';
import { AeroBadgeComponent } from '../index';

describe('AeroBadgeComponent', () => {
  for (const type of [AeroBadgeComponent])
    it(`renders ${type.name} defaults`, () => {
      const fixture = TestBed.createComponent(type as any);
      fixture.detectChanges();
      expect(fixture.nativeElement.children.length).toBeGreaterThan(0);
    });
});
