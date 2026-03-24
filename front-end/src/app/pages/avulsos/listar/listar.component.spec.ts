import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { ListarComponent } from './listar.component';

describe('ListarComponent', () => {
  let component: ListarComponent;
  let fixture: ComponentFixture<ListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarComponent],
      providers: [provideHttpClient(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
