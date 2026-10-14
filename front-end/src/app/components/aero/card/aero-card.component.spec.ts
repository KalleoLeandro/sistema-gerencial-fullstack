import { TestBed } from '@angular/core/testing';
import { AeroCardComponent } from '../index';

describe('AeroCardComponent', () => {
  for (const type of [AeroCardComponent])
    it(`renders ${type.name} defaults`, () => {
      const fixture = TestBed.createComponent(type as any);
      fixture.detectChanges();
      expect(fixture.nativeElement.children.length).toBeGreaterThan(0);
    });
});
