import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { DetalhesComponent } from './detalhes.component';
import { of, throwError } from 'rxjs';
import { DetalhesComponent as Avulso } from './detalhes.component';
import { AvulsoService } from '@services/avulso.service';
import { LoginService } from '@services/login.service';
import { PdfExportService } from '@services/pdf-export.service';
import { pageSetup } from '../../../testing/page.testing';

describe('DetalhesComponent', () => {
  let component: DetalhesComponent;
  let fixture: ComponentFixture<DetalhesComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
{
  const config = {
    type: Avulso,
    token: AvulsoService,
    load: 'carregarAtendimentoAvulso',
    edit: 'alterarAvulso',
    remove: 'excluirAvulso',
    apiRemove: 'excluirAvulso',
    modal: 'modalExcluirAvulso',
    status: 'alterarStatusAvulso',
    saveStatus: 'salvarStatusAvulso',
    apiStatus: 'alterarStatusAtendimento',
  };
  describe(`Order details ${config.token.name}`, () => {
    let setup: ReturnType<typeof pageSetup>;
    let c: any;
    let service: any;
    beforeEach(() => {
      setup = pageSetup({ id_empresa: '3', id_equipamento: '4' }, { id: '42' });
      service = setup.mock(config.token);
      service.buscarPorId.and.returnValue(
        of({
          id: 42,
          executores: '[{"id":1,"nome":"Ana"}]',
          motivo_cancelamento: '',
        }),
      );
      setup
        .mock(LoginService)
        .buscarPorToken.and.returnValue(of({ nome: 'Admin' }));
      c = setup.create(config.type as any);
      spyOn(console, 'log');
    });
    it('loads executors and routes to editing and commercial flow', () => {
      expect(c.listaExecutores).toEqual([{ id: 1, nome: 'Ana' }]);
      c[config.edit]();
      c.abrirFluxoComercial();
      expect(setup.router.navigate).toHaveBeenCalledTimes(2);
      c.exportarPdf();
      expect(
        setup.mock(PdfExportService).exportElementToPdf,
      ).toHaveBeenCalled();
      service.buscarPorId.and.returnValue(
        throwError(() => new Error('offline')),
      );
      c[config.load](42);
      expect(console.log).toHaveBeenCalled();
    });
    it('changes status and attaches cancellation attribution', () => {
      c[config.status]();
      expect(service[config.apiStatus]).not.toHaveBeenCalled();
      c.statusSelecionado = 2;
      c[config.status]();
      expect(service[config.apiStatus]).toHaveBeenCalledWith('42', 2, '');
      expect(c.statusSelecionado).toBe(0);
      c.statusSelecionado = 4;
      c[config.status]();
      c.motivo_cancelamento = 'Cliente solicitou';
      c[config.saveStatus]();
      expect(service[config.apiStatus]).toHaveBeenCalledWith(
        '42',
        4,
        jasmine.stringMatching(/Cliente solicitou[\s\S]*Cancelado por Admin/),
      );
      c.statusSelecionado = 5;
      c[config.saveStatus]();
      expect(console.log).toHaveBeenCalled();
    });
    it('reports token/status/deletion failures and handles confirmation', () => {
      setup
        .mock(LoginService)
        .buscarPorToken.and.returnValue(throwError(() => new Error('offline')));
      c.statusSelecionado = 4;
      c[config.status]();
      expect(c.resposta).toContain('Erro');
      service[config.apiStatus].and.returnValue(
        throwError(() => new Error('offline')),
      );
      c[config.saveStatus]();
      expect(c.resposta).toContain('Erro');
      const confirm = spyOn(window, 'confirm').and.returnValue(false);
      c[config.modal]();
      confirm.and.returnValue(true);
      c[config.modal]();
      c[config.remove]();
      expect(service[config.apiRemove]).toHaveBeenCalled();
      service[config.apiRemove].and.returnValue(
        throwError(() => new Error('offline')),
      );
      c[config.remove]();
      expect(c.resposta).toContain('Erro');
      c.resposta = 'Erro';
      c.redirecionar();
      c.resposta = 'Sucesso';
      c.excluir = false;
      c.redirecionar();
    });
    it('moves and restores modals without leaving them attached to body', () => {
      const host = document.createElement('div');
      host.innerHTML =
        '<div id="modalConfirmacaoEmpresa"></div><span></span><div id="modalConfirmacao"></div><div id="modalMotivoCancelamento"></div>';
      document.body.append(host);
      try {
        c.ngAfterViewInit();
        expect(
          document.getElementById('modalMotivoCancelamento')!.parentNode,
        ).toBe(document.body);
        c.ngOnDestroy();
        expect(host.querySelector('#modalMotivoCancelamento')).not.toBeNull();
      } finally {
        host.remove();
      }
    });
  });
}
