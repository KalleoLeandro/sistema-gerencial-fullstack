import { TestBed } from '@angular/core/testing';
import { AeroTableComponent } from '../index';

describe('AeroTableComponent', () => {
  for (const type of [AeroTableComponent])
    it(`renders ${type.name} defaults`, () => {
      const fixture = TestBed.createComponent(type as any);
      fixture.detectChanges();
      expect(fixture.nativeElement.children.length).toBeGreaterThan(0);
    });
});

describe('AeroTableComponent data', () => {
  it('renders table columns, missing values and empty rows', () => {
    const fixture = TestBed.createComponent(AeroTableComponent);
    fixture.componentInstance.columns = [{ key: 'name', label: 'Nome' }];
    fixture.componentInstance.rows = [{ name: 'Ana' }, {}];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ana');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
    fixture.componentInstance.rows = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhum registro');
  });
});
