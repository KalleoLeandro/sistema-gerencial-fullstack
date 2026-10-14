import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { CadastrarComponent } from './cadastrar.component';
import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { CadastrarComponent as Avulso } from './cadastrar.component';
import { AvulsoService } from '@services/avulso.service';
import { LoginService } from '@services/login.service';
import { ToastService } from '@services/toast.service';
import { UtilsService } from '@services/utils.service';
import { pageSetup } from '../../../testing/page.testing';

describe('CadastrarComponent', () => {
  let component: CadastrarComponent;
  let fixture: ComponentFixture<CadastrarComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideEnvironmentNgxMask(),
        provideNativeDateAdapter(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CadastrarComponent);
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
    service: AvulsoService,
    register: 'cadastrarAvulso',
    update: 'atualizarAvulso',
    load: 'carregarAtendimentoAvulso',
    save: 'cadastrarAtualizarAvulso',
    id: 'id',
  };
  describe(`${config.type.name}: ${config.service.name}`, () => {
    let setup: ReturnType<typeof pageSetup>;
    let component: any;
    let service: any;
    const record = {
      id: 42,
      id_empresa: 3,
      id_equipamento: 4,
      data_inicio: '2026-10-13T10:00:00',
      data_fim: '2026-10-13T11:00:00',
      executores: '[{"id":1,"nome":"Ana"}]',
      descricao: 'Manutenção',
      valor_servico: 100,
      solicitante: 'Cliente',
      tipo_atendimento: 'Remoto',
      observacoes: 'Histórico',
      deslocamento: 5,
      valor_deslocamento: 3,
      total: 15,
      nome_cliente: 'João',
      tipo_pessoa: 'f',
      cpf_cnpj: '12345678901',
    };
    beforeEach(() => {
      setup = pageSetup({ id_empresa: '3', id_equipamento: '4' });
      service = setup.mock(config.service);
      service.buscarPorId.and.returnValue(of(record));
      component = setup.create(config.type as any);
      spyOn(console, 'log');
      spyOn(window, 'scrollTo');
    });
    function validForm() {
      component[config.load]();
      component.cadastroForm.patchValue({
        nome_cliente: 'João',
        cpf_cnpj: '12345678901',
        tipo_pessoa: 'f',
        id_empresa: 3,
        descricao: 'Serviço',
        executores: '[{"id":1}]',
        valor_servico: 100,
        solicitante: 'Cliente',
        tipo_atendimento: 'Remoto',
      });
    }
    it('selects executors once and edits the external executor', () => {
      component.setExecutor({ id: 1, nome: 'Ana' });
      component.setExecutor({ id: 1, nome: 'Ana' });
      expect(component.listaExecutores().length).toBe(1);
      component.setExecutor({ id: 0 });
      component.confirmarOutro();
      expect(component.listaExecutores().length).toBe(1);
      component.outroNome.set('  Externo  ');
      component.confirmarOutro();
      component.setExecutor({ id: 0 });
      expect(component.outroNome()).toBe('Externo');
      component.outroNome.set('Novo');
      component.confirmarOutro();
      expect(
        JSON.parse(component.cadastroForm.get('executores').value),
      ).toEqual([
        { id: 1, nome: 'Ana' },
        { id: 0, nome: 'Novo' },
      ]);
      component.removerExecutor(1);
      expect(component.listaExecutores()).toEqual([{ id: 0, nome: 'Novo' }]);
      component.listaExecutores.set(null);
      component.setExecutor({ id: 2, nome: 'Bia' });
      expect(component.listaExecutores()).toEqual([{ id: 2, nome: 'Bia' }]);
    });
    it('loads the existing record and keeps historical notes separate', () => {
      component[config.load]();
      expect(component.cadastroForm.get('id').value).toBe(42);
      expect(component.historicoObservacoes).toBe('Histórico');
      expect(component.cadastroForm.get('observacoes').value).toBe('');
      expect(component.inicioHora.getHours()).toBe(10);
      expect(component.getMinFimData().getDate()).toBe(13);
      expect(component.getMinFimHora()).toBe(component.inicioHora);
    });
    it('validates required fields, chronology and invalid inputs', () => {
      expect(component.verificarFormularioValido()).toBeFalse();
      component.onInicioDataChange('13/10/2026');
      component.onInicioHoraChange(new Date(2026, 9, 13, 10));
      component.onFimDataChange('14/10/2026');
      component.onFimHoraChange(new Date(2026, 9, 14, 11));
      expect(component.verificarFormularioValido()).toBeFalse();
      expect(window.scrollTo).toHaveBeenCalled();
      expect(component.getMinFimHora()).toBeNull();
      validForm();
      expect(component.verificarFormularioValido()).toBeTrue();
      component.onFimHoraChange(new Date(2026, 9, 13, 9));
      expect(component.fimHora).toBeNull();
      component.onFimDataChange('12/10/2026');
      component.onFimHoraChange(new Date(2026, 9, 12, 11));
      expect(component.cadastroForm.hasError('intervaloInvalido')).toBeTrue();
      for (const input of [null, 42, 'invalid', new Date(NaN), '31/02/2026'])
        expect(component['parseDateTimeValue'](input)).toBeNull();
      expect(
        component['parseDateTimeValue']('2026-10-13 12:30:00').getHours(),
      ).toBe(12);
      expect(
        component['parseDateTimeValue']('13/10/2026 12:30').getMinutes(),
      ).toBe(30);
      component.onInicioDataChange(null);
      expect(component.getMinFimData()).toBe(component.minDate);
      expect(component.getMinFimHora()).toBeNull();
    });
    it('restores the last valid price when exceeding the allowed value', () => {
      component.cadastroForm.patchValue({ valor_servico: 200 });
      component.onChangePreco({ target: { name: 'valor_servico' } });
      component.cadastroForm.patchValue({ valor_servico: 10001 });
      component.onChangePreco({ target: { name: 'valor_servico' } });
      expect(component.cadastroForm.get('valor_servico').value).toBe(200);
    });
    for (const operation of ['cadastrar', 'atualizar']) {
      const method =
        operation === 'cadastrar' ? config.register : config.update;
      it(`${operation} sends the form and navigates on success`, () => {
        validForm();
        component[operation]();
        expect(service[method]).toHaveBeenCalledWith(component.cadastroForm);
        expect(setup.mock(ToastService).success).toHaveBeenCalled();
        expect(setup.router.navigate).toHaveBeenCalled();
      });
      it(`${operation} releases the busy state and exposes backend errors`, () => {
        service[method].and.returnValue(
          throwError(() => ({ error: { message: 'Falha controlada' } })),
        );
        component[operation]();
        expect(component.salvando).toBeFalse();
        expect(setup.mock(ToastService).error).toHaveBeenCalledWith(
          'Falha controlada',
        );
        expect(setup.router.navigate).not.toHaveBeenCalled();
      });
      it(`${operation} prevents duplicate requests while pending`, () => {
        service[method].and.returnValue(new Subject());
        component[operation]();
        component[operation]();
        expect(service[method]).toHaveBeenCalledTimes(1);
      });
    }
    it('dispatches create/update and requires justification for changed dates', () => {
      validForm();
      component[config.save]();
      expect(service[config.register]).toHaveBeenCalled();
      component.salvando = false;
      component[config.id] = 42;
      component[config.save]();
      expect(service[config.update]).toHaveBeenCalled();
      service[config.update].calls.reset();
      component.salvando = false;
      component.onFimDataChange('14/10/2026');
      component[config.save]();
      expect(service[config.update]).not.toHaveBeenCalled();
      component.confirmarJustificativaAlteracao();
      expect(
        component.cadastroForm.get('justificativa_alteracao_data').touched,
      ).toBeTrue();
      component.cadastroForm.patchValue({
        justificativa_alteracao_data: 'Cliente solicitou',
      });
      component.confirmarJustificativaAlteracao();
      expect(service[config.update]).toHaveBeenCalled();
    });
    it('resets a new form and reloads an existing record', () => {
      validForm();
      component.limparFormulario();
      expect(component.inicioData).toBeNull();
      expect(component.listaExecutores()).toEqual([]);
      component[config.id] = 42;
      component.limparFormulario();
      expect(component.inicioData).not.toBeNull();
    });
    it('handles lookup errors without overwriting form data', () => {
      service.buscarPorId.and.returnValue(
        throwError(() => new Error('offline')),
      );
      component[config.load]();
      setup
        .mock(LoginService)
        .buscarTodos.and.returnValue(throwError(() => new Error('offline')));
      component.consultarExecutores();
      expect(console.log).toHaveBeenCalledTimes(2);
    });
    it('moves nested modals to body and restores their original order', () => {
      const host = document.createElement('div');
      host.innerHTML =
        '<div id="modalBusca"></div><span></span><div id="modalJustificativaData"></div>';
      document.body.append(host);
      try {
        component.ngAfterViewInit();
        expect(document.getElementById('modalBusca')!.parentNode).toBe(
          document.body,
        );
        component.ngOnDestroy();
        expect(host.firstElementChild!.id).toBe('modalBusca');
        expect(host.lastElementChild!.id).toBe('modalJustificativaData');
      } finally {
        host.remove();
      }
    });
  });
}
describe('Avulso: deslocamento e dados de cliente', () => {
  it('calculates transport automatically and validates phone length', fakeAsync(() => {
    const setup = pageSetup();
    const component = setup.create(Avulso);
    component.ngOnInit();
    component.cadastroForm.patchValue({
      deslocamento: 5,
      valor_deslocamento: 3,
    });
    flushMicrotasks();
    expect(component.cadastroForm.get('total')!.value).toBe(15);
    component.cadastroForm.patchValue({ celular: '123' });
    expect(component.cadastroForm.get('celular')!.invalid).toBeTrue();
    component.cadastroForm.patchValue({ celular: '(11) 99999-9999' });
    expect(component.cadastroForm.get('celular')!.valid).toBeTrue();
    component.onTipoPessoaChange('j');
    expect(component.cadastroForm.get('razao_social')!.invalid).toBeTrue();
    component.onTipoPessoaChange('f');
    expect(component.cadastroForm.get('razao_social')!.valid).toBeTrue();
  }));
  it('looks up CEP and CNPJ, avoids duplicates and permits retry after failure', () => {
    const setup = pageSetup();
    const component = setup.create(Avulso);
    const utils = setup.mock(UtilsService);
    utils.buscarEnderecoPorCep.and.returnValue(
      of({
        logradouro: 'Rua A',
        bairro: 'Centro',
        localidade: 'São Paulo',
        uf: 'SP',
      }),
    );
    component.cadastroForm.patchValue({ cep: '123' });
    component.buscarCep();
    expect(utils.buscarEnderecoPorCep).not.toHaveBeenCalled();
    component.cadastroForm.patchValue({ cep: '01.001-000' });
    component.buscarCep();
    expect(component.cadastroForm.get('endereco')!.value).toBe('Rua A');
    component.buscarCnpj();
    expect(utils.buscarDadosPorCnpj).not.toHaveBeenCalled();
    component.cadastroForm.patchValue({ tipo_pessoa: 'j', cpf_cnpj: '123' });
    component.buscarCnpj();
    utils.buscarDadosPorCnpj.and.returnValue(
      of({
        razao_social: 'Empresa',
        estabelecimento: {
          nome_fantasia: 'Loja',
          tipo_logradouro: 'Rua',
          logradouro: 'A',
          numero: '12A',
          cep: '01001000',
          ddd1: '11',
          telefone1: '33334444',
          cidade: { nome: 'São Paulo' },
          estado: { sigla: 'SP' },
          inscricoes_estaduais: [{ ativo: true, inscricao_estadual: 'IE' }],
        },
      }),
    );
    component.cadastroForm.patchValue({ cpf_cnpj: '12.345.678/0001-90' });
    component.buscarCnpj();
    component.buscarCnpj();
    expect(utils.buscarDadosPorCnpj).toHaveBeenCalledTimes(1);
    expect(component.cadastroForm.get('nome_cliente')!.value).toBe('Loja');
    expect(component.cadastroForm.get('numero')!.value).toBe(12);
    expect(component.cadastroForm.get('telefone')!.value).toBe(
      '(11) 3333-4444',
    );
    component.cadastroForm.patchValue({ cpf_cnpj: '22345678000190' });
    utils.buscarDadosPorCnpj.and.returnValue(
      throwError(() => new Error('offline')),
    );
    component.buscarCnpj();
    component.buscarCnpj();
    expect(utils.buscarDadosPorCnpj).toHaveBeenCalledTimes(3);
    const c = component as any;
    c.preencherDadosPorCnpj(null);
    c.preencherDadosPorCnpj({
      razao_social: 'Razão',
      estabelecimento: {
        inscricoes_estaduais: [{ inscricao_estadual: 'IE2' }],
        ddd1: '11',
        telefone1: '999999999',
      },
    });
    expect(component.cadastroForm.get('telefone')!.value).toBe(
      '(11) 99999-9999',
    );
    expect(c.normalizeNumber('s/n')).toBeNull();
    expect(c.normalizeNumber(null)).toBeNull();
    expect(c.formatarTelefone(null, null)).toBe('');
  });
});
