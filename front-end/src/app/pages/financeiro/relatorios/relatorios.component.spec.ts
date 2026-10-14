import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FinanceiroService } from '@services/financeiro.service';
import { ToastService } from '@services/toast.service';
import { RelatoriosComponent } from './relatorios.component';
import { throwError } from 'rxjs';
import { pageSetup } from '../../../testing/page.testing';

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

describe('Financial report export', () => {
  it('exports financial CSV with amounts and both cashflow regimes', async () => {
    const setup = pageSetup();
    const c = setup.create(RelatoriosComponent);
    const api = setup.mock(FinanceiroService);
    const create = spyOn(URL, 'createObjectURL').and.returnValue('blob:report');
    const revoke = spyOn(URL, 'revokeObjectURL');
    spyOn(HTMLAnchorElement.prototype, 'click');
    c.exportar();
    expect(create).not.toHaveBeenCalled();
    const report = {
      resumo: {
        aPagar: 60,
        aReceber: 150,
        pagarVencido: 5,
        receberVencido: 10,
        pago: 40,
        recebido: 50,
        saldoRealizado: 10,
        saldoPrevisto: 90,
      },
      realizado: [{ data: '2026-10-13', entradas: 50, saidas: 40, saldo: 10 }],
      previsto: [{ data: '2026-10-14', entradas: 150, saidas: 60, saldo: 90 }],
    };
    api.relatorio.and.returnValue(of(report));
    c.ngOnInit();
    c.exportar();
    const csv = await (create.calls.mostRecent().args[0] as Blob).text();
    expect(csv).toContain('"50,00"');
    expect(csv).toContain('"Realizado"');
    expect(csv).toContain('"Previsto"');
    expect(revoke).toHaveBeenCalledWith('blob:report');
    api.relatorio.and.returnValue(
      throwError(() => ({ error: { message: 'Falha' } })),
    );
    c.carregar();
    expect(c.carregando()).toBeFalse();
    expect(c.relatorio()).toBeNull();
    expect(setup.mock(ToastService).error).toHaveBeenCalledWith('Falha');
  });
});
