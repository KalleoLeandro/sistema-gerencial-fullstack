import { TestBed } from '@angular/core/testing';
import { AeroAlertComponent } from '../index';

describe('AeroAlertComponent', () => {
  for (const type of [AeroAlertComponent])
    it(`renders ${type.name} defaults`, () => {
      const fixture = TestBed.createComponent(type as any);
      fixture.detectChanges();
      expect(fixture.nativeElement.children.length).toBeGreaterThan(0);
    });
});
