import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FinanceiroService } from '@services/financeiro.service';
import { ToastService } from '@services/toast.service';
import { RelatoriosComponent } from './relatorios.component';

describe('Financeiro: relatórios', () => {
  it('apresenta o fluxo realizado e previsto separadamente', () => {
    const api = jasmine.createSpyObj('FinanceiroService', ['relatorio']);
    api.relatorio.and.returnValue(
      of({
        resumo: {
          aPagar: 60,
          aReceber: 150,
          pagarVencido: 0,
          receberVencido: 0,
          pago: 40,
          recebido: 50,
          saldoRealizado: 10,
          saldoPrevisto: 90,
        },
        realizado: [
          { data: '2026-10-13', entradas: 50, saidas: 40, saldo: 10 },
        ],
        previsto: [],
      }),
    );
    TestBed.configureTestingModule({
      imports: [RelatoriosComponent],
      providers: [
        provideRouter([]),
        { provide: FinanceiroService, useValue: api },
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj('ToastService', ['warning', 'error']),
        },
      ],
    });
    const fixture = TestBed.createComponent(RelatoriosComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Fluxo realizado');
    expect(fixture.nativeElement.textContent).toContain('Fluxo previsto');
    expect(fixture.componentInstance.relatorio()?.resumo.saldoRealizado).toBe(
      10,
    );
    fixture.componentInstance.inicio = '2026-10-20';
    fixture.componentInstance.fim = '2026-10-01';
    fixture.componentInstance.carregar();
    expect(api.relatorio).toHaveBeenCalledTimes(1);
  });
});
