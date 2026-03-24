import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';

import { CadastrarComponent } from './cadastrar.component';

describe('CadastrarComponent', () => {
  let component: CadastrarComponent;
  let fixture: ComponentFixture<CadastrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarComponent],
      providers: [provideHttpClient(), provideRouter([]), provideEnvironmentNgxMask()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
