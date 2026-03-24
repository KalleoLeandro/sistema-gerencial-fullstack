import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardService } from '@services/dashboard.service';

import { AgendaComponent } from './agenda.component';

describe('AgendaComponent', () => {
  let component: AgendaComponent;
  let fixture: ComponentFixture<AgendaComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;

  beforeEach(async () => {
    dashboardServiceSpy = jasmine.createSpyObj<DashboardService>('DashboardService', ['retornarAgendaEventos']);
    dashboardServiceSpy.retornarAgendaEventos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AgendaComponent],
      providers: [
        provideRouter([]),
        { provide: DashboardService, useValue: dashboardServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
