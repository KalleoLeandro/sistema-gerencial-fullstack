import { TestBed } from '@angular/core/testing';
import { AeroSegmentedComponent } from '../index';

describe('AeroSegmentedComponent', () => {
  it('emits the selected segment through its accessible button', () => {
    const fixture = TestBed.createComponent(AeroSegmentedComponent);
    fixture.componentInstance.options = [
      { label: 'Lista', value: 'list' },
      { label: 'Bloqueado', value: 'blocked', disabled: true },
    ];
    const change = jasmine.createSpy();
    fixture.componentInstance.valueChange.subscribe(change);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(change).toHaveBeenCalledWith('list');
    expect(
      fixture.nativeElement.querySelectorAll('button')[1].disabled,
    ).toBeTrue();
  });
});
