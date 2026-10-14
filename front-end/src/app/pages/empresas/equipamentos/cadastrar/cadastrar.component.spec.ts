import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { CadastrarComponent } from './cadastrar.component';
import { of, throwError } from 'rxjs';
import { CadastrarComponent as Equipamento } from './cadastrar.component';
import { EquipamentoService } from '@services/equipamento.service';
import { ToastService } from '@services/toast.service';
import { pageSetup } from '../../../../testing/page.testing';

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
    type: Equipamento,
    token: EquipamentoService,
    load: 'carregarEquipamento',
    get: 'buscarEquipamentoPorId',
    save: 'cadastrarAtualizarEquipamento',
    create: 'cadastrarEquipamento',
    update: 'atualizarEquipamento',
    data: {
      id: 42,
      id_empresa: 3,
      nome_maquina: 'PC',
      setor: 'RH',
      tipo_equipamento: 'Desktop',
    },
  };
  describe(`${config.type.name} ${config.token.name}`, () => {
    for (const existing of [false, true])
      for (const error of [false, true])
        it(`saves record existing=${existing} error=${error}`, () => {
          const setup = pageSetup({
            id_empresa: '3',
            ...(existing ? { id: '42' } : {}),
          });
          const service = setup.mock(config.token);
          service[config.get].and.returnValue(of(config.data));
          const c: any = setup.create(config.type as any);
          c.cadastroForm.patchValue(config.data);
          service[existing ? config.update : config.create].and.returnValue(
            error
              ? throwError(() => ({ error: { message: 'Falha' } }))
              : of(42),
          );
          c[config.save]();
          expect(
            service[existing ? config.update : config.create],
          ).toHaveBeenCalled();
          if (error) {
            expect(c.salvando).toBeFalse();
            expect(setup.mock(ToastService).error).toHaveBeenCalledWith(
              'Falha',
            );
          } else expect(setup.router.navigate).toHaveBeenCalled();
          c.limparFormulario();
          c.salvando = true;
          c[config.save]();
          expect(
            service[existing ? config.update : config.create],
          ).toHaveBeenCalledTimes(1);
        });
    it('handles loading errors and clears fields for the selected equipment type', () => {
      const setup = pageSetup({ id_empresa: '3' });
      const service = setup.mock(config.token);
      const c: any = setup.create(config.type as any);
      spyOn(console, 'log');
      service[config.get].and.returnValue(
        throwError(() => new Error('offline')),
      );
      c[config.load]();
      {
        expect(c.verificarFormularioValido()).toBeFalse();
        c.cadastroForm.patchValue({
          placa_mae: 'A',
          gabinete: 'B',
          tipo_equipamento: 'Notebook',
        });
        c.mudarTipoEquipamento();
        expect(c.cadastroForm.get('placa_mae').value).toBe('');
        c.cadastroForm.patchValue({
          marca: 'A',
          modelo: 'B',
          numero_serie: 'C',
          tipo_equipamento: 'Desktop',
        });
        c.mudarTipoEquipamento();
        expect(c.cadastroForm.get('marca').value).toBe('');
      }
    });
  });
}
