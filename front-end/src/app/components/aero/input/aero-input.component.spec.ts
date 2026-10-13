import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideNgxMask } from 'ngx-mask';
import { AeroInputComponent } from './aero-input.component';

@Component({
  imports: [FormsModule, AeroInputComponent],
  template: `<app-aero-input label="Pesquisar" type="search" [mask]="mask"
    [(ngModel)]="search" (ngModelChange)="changes.push($event)" />`,
})
class SearchHost {
  mask = '000.000.000-00';
  search = '';
  changes: string[] = [];
}

describe('AeroInput: pesquisa com máscara', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideNgxMask()] }));

  for (const [mask, raw, formatted] of [
    ['000.000.000-00', '52998224725', '529.982.247-25'],
    ['00.000.000/0000-00', '11222333000181', '11.222.333/0001-81'],
  ]) {
    it(`mantém a máscara ${mask} e envia o valor sem pontuação`, async () => {
      const fixture = TestBed.createComponent(SearchHost);
      fixture.componentInstance.mask = mask;
      fixture.detectChanges();
      await fixture.whenStable();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.value = raw;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(input.value).toBe(formatted);
      expect(fixture.componentInstance.search).toBe(raw);
      expect(fixture.componentInstance.changes.at(-1)).toBe(raw);
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      expect(fixture.componentInstance.search).toBe('');
    });
  }
});
