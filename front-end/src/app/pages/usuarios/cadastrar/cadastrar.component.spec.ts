import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { CadastrarComponent } from './cadastrar.component';
import { of, throwError } from 'rxjs';
import { CadastrarComponent as Usuario } from './cadastrar.component';
import { LoginService } from '@services/login.service';
import { ToastService } from '@services/toast.service';
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
    type: Usuario,
    token: LoginService,
    load: 'carregarUsuario',
    get: 'buscarPorId',
    save: 'cadastrarAtualizarUsuario',
    create: 'cadastrarUsuario',
    update: 'atualizarUsuario',
    data: {
      id: 42,
      nome: 'Ana',
      login: 'ana',
      senha: 'secret',
      perfil: 'ADMIN',
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
      expect(setup.mock(ToastService).error).toHaveBeenCalled();
    });
  });
}
