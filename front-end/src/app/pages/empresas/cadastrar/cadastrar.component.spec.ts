import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { CadastrarComponent } from './cadastrar.component';
import { of, Subject, throwError } from 'rxjs';
import { CadastrarComponent as Cliente } from './cadastrar.component';
import { EmpresasService } from '@services/empresas.service';
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

describe('Customer registration and contract renewal', () => {
  let setup: ReturnType<typeof pageSetup>;
  let c: Cliente;
  let service: any;
  beforeEach(() => {
    setup = pageSetup();
    service = setup.mock(EmpresasService);
    c = setup.create(Cliente);
    c.minDate = new Date(2026, 9, 13);
    spyOn(window, 'scrollTo');
    spyOn(console, 'log');
  });
  function valid() {
    c.cadastroForm.patchValue({
      tipo_pessoa: 'f',
      nome_fantasia: 'Ana',
      cpf_cnpj: '12345678901',
    });
  }
  it('switches personal/business validators and requires contract dates when needed', () => {
    expect(c.verificarFormularioValido()).toBeFalse();
    expect(c.isInvalid('razao_social')).toBeTrue();
    expect(c.isInvalid('missing')).toBeFalse();
    valid();
    expect(c.verificarFormularioValido()).toBeTrue();
    c.cadastroForm.patchValue({ celular: '123' });
    expect(c.cadastroForm.get('celular')!.hasError('minDigits')).toBeTrue();
    c.cadastroForm.patchValue({
      celular: '(11) 99999-9999',
      possui_contrato: true,
    });
    expect(c.possuiHistoricoContrato).toBeTrue();
    expect(c.verificarFormularioValido()).toBeFalse();
    c.cadastroForm.patchValue({
      data_inicio: new Date(2026, 9, 14),
      data_fim: new Date(2026, 9, 13),
    });
    expect(c.cadastroForm.hasError('dataInicioMaiorQueDataFim')).toBeTrue();
    expect(c.hasDateRangeError('data_fim')).toBeTrue();
    c.cadastroForm.patchValue({
      data_inicio: new Date(2026, 9, 10),
      data_fim: new Date(2026, 9, 12),
    });
    expect(c.verificarFormularioValido()).toBeFalse();
    c.cadastroForm.patchValue({ data_fim: new Date(2026, 9, 14) });
    expect(c.verificarFormularioValido()).toBeTrue();
    c.verificarDatas();
    expect(c.cadastroForm.get('data_inicio')!.value).toBe(
      '2026-10-10T00:00:00',
    );
    c.cadastroForm.patchValue({ teve_contrato: false });
    expect(c.cadastroForm.get('possui_contrato')!.value).toBeFalse();
    expect(c.cadastroForm.get('data_inicio')!.value).toBe('');
    c.imprimir();
  });
  for (const existing of [false, true])
    for (const outcome of ['success', 'error', 'pending'])
      it(`saves ${existing ? 'existing' : 'new'} client ${outcome}`, () => {
        valid();
        c.id = existing ? 42 : null;
        const method = existing ? 'atualizarEmpresa' : 'cadastrarEmpresa';
        service[method].and.returnValue(
          outcome === 'success'
            ? of(42)
            : outcome === 'error'
              ? throwError(() => ({ error: { message: 'Falha' } }))
              : new Subject(),
        );
        c.cadastrarAtualizarEmpresa();
        expect(service[method]).toHaveBeenCalledWith(c.cadastroForm);
        if (outcome === 'success')
          expect(setup.router.navigate).toHaveBeenCalledWith([
            '/clientes/listar',
          ]);
        if (outcome === 'error') {
          expect(c.salvando).toBeFalse();
          expect(setup.mock(ToastService).error).toHaveBeenCalledWith('Falha');
        }
        if (outcome === 'pending') {
          c.cadastrarAtualizarEmpresa();
          expect(service[method]).toHaveBeenCalledTimes(1);
        }
      });
  it('loads current/legacy client fields and resets or reloads the form', () => {
    service.buscarPorId.and.returnValue(
      of({
        id: 42,
        nome_fantasia: 'Loja',
        cnpj: '123',
        inscricao: 'IE',
        data_inicio: '2026-10-13',
        data_fim: '2026-10-14',
        possui_contrato: true,
        teve_contrato: true,
      }),
    );
    c.id = 42;
    c.carregarEmpresa();
    expect(c.cadastroForm.get('cpf_cnpj')!.value).toBe('123');
    expect(c.cadastroForm.get('nome_cliente')!.value).toBe('Loja');
    c.limparFormulario();
    expect(service.buscarPorId).toHaveBeenCalledTimes(2);
    c.id = null;
    c.limparFormulario();
    expect(c.cadastroForm.get('nome_fantasia')!.value).toBeNull();
    service.buscarPorId.and.returnValue(throwError(() => new Error('offline')));
    c.carregarEmpresa();
    expect(console.log).toHaveBeenCalled();
  });
  it('looks up and maps CEP and CNPJ with duplicate suppression and retry', () => {
    const utils = setup.mock(UtilsService);
    c.cadastroForm.patchValue({ cep: '123' });
    c.buscarCep();
    expect(utils.buscarEnderecoPorCep).not.toHaveBeenCalled();
    utils.buscarEnderecoPorCep.and.returnValue(
      of({
        logradouro: 'Rua',
        bairro: 'Centro',
        localidade: 'São Paulo',
        uf: 'SP',
        numero: 10,
      }),
    );
    c.cadastroForm.patchValue({ cep: '01001-000' });
    c.buscarCep();
    expect(c.cadastroForm.get('cidade')!.value).toBe('São Paulo');
    utils.buscarEnderecoPorCep.and.returnValue(
      throwError(() => new Error('offline')),
    );
    c.buscarCep();
    expect(console.log).toHaveBeenCalled();
    c.buscarCnpj();
    expect(utils.buscarDadosPorCnpj).not.toHaveBeenCalled();
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
    c.cadastroForm.patchValue({ cpf_cnpj: '12345678000190' });
    c.buscarCnpj();
    c.buscarCnpj();
    expect(utils.buscarDadosPorCnpj).toHaveBeenCalledTimes(1);
    expect(c.cadastroForm.get('nome_fantasia')!.value).toBe('Loja');
    c.cadastroForm.patchValue({ cpf_cnpj: '22345678000190' });
    utils.buscarDadosPorCnpj.and.returnValue(
      throwError(() => new Error('offline')),
    );
    c.buscarCnpj();
    c.buscarCnpj();
    expect(utils.buscarDadosPorCnpj).toHaveBeenCalledTimes(3);
    const internal = c as any;
    internal.preencherDadosPorCnpj(null);
    internal.preencherDadosPorCnpj({
      razao_social: 'Razão',
      estabelecimento: {
        inscricoes_estaduais: [{ inscricao_estadual: 'IE2' }],
        ddd1: '11',
        telefone1: '999999999',
      },
    });
    expect(c.cadastroForm.get('telefone')!.value).toBe('(11) 99999-9999');
    expect(internal.normalizeNumber(null)).toBeNull();
    expect(internal.normalizeNumber('s/n')).toBeNull();
    expect(internal.formatarTelefone(null, null)).toBe('');
    c.cadastroForm.patchValue({ tipo_pessoa: 'f' });
    c.buscarCnpj();
    expect(utils.buscarDadosPorCnpj).toHaveBeenCalledTimes(3);
  });
  it('requires valid renewal dates, saves contract history and handles failure', () => {
    c.renovarContrato();
    expect(service.renovarContrato).not.toHaveBeenCalled();
    c.id = 42;
    c.renovacaoDataInicio = new Date(2026, 9, 14);
    c.renovacaoDataFim = new Date(2026, 9, 13);
    c.renovarContrato();
    expect(setup.mock(ToastService).error).toHaveBeenCalled();
    c.renovacaoDataInicio = new Date(2026, 9, 10);
    c.renovacaoDataFim = new Date(2026, 9, 12);
    c.renovarContrato();
    expect(service.renovarContrato).not.toHaveBeenCalled();
    c.renovacaoDataInicio = new Date(2026, 9, 13);
    c.renovacaoDataFim = new Date(2026, 9, 14);
    c.renovacaoObservacoes = '  Renovação  ';
    c.renovarContrato();
    expect(service.renovarContrato).toHaveBeenCalledWith(42, {
      data_inicio: '2026-10-13T00:00:00',
      data_fim: '2026-10-14T00:00:00',
      observacoes: 'Renovação',
    });
    expect(c.renovandoContrato).toBeFalse();
    expect(c.renovacaoDataInicio).toBeNull();
    c.renovacaoDataInicio = new Date(2026, 9, 13);
    c.renovacaoDataFim = new Date(2026, 9, 14);
    service.renovarContrato.and.returnValue(
      throwError(() => ({ error: { message: 'Falha' } })),
    );
    c.renovarContrato();
    expect(c.renovandoContrato).toBeFalse();
  });
});
