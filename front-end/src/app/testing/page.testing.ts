import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { AtendimentoService } from '@services/atendimento.service';
import { AvulsoService } from '@services/avulso.service';
import { ManutencaoService } from '@services/manutencao.service';
import { LoginService } from '@services/login.service';
import { UtilsService } from '@services/utils.service';
import { ToastService } from '@services/toast.service';
import { ComercialService } from '@services/comercial.service';
import { ProdutoService } from '@services/produto.service';
import { ServicoComercialService } from '@services/servico-comercial.service';
import { EmpresasService } from '@services/empresas.service';
import { EquipamentoService } from '@services/equipamento.service';
import { PdfExportService } from '@services/pdf-export.service';
import { FinanceiroService } from '@services/financeiro.service';
import { ImagemService } from '@services/imagem.service';
import { AgendamentoService } from '@services/agendamento.service';

export function pageSetup(
  query: Record<string, string> = {},
  params: Record<string, string> = {},
  data: any = {},
  url = '',
) {
  const services = [
    AtendimentoService,
    AvulsoService,
    ManutencaoService,
    LoginService,
    UtilsService,
    ToastService,
    ComercialService,
    ProdutoService,
    ServicoComercialService,
    EmpresasService,
    EquipamentoService,
    PdfExportService,
    FinanceiroService,
    ImagemService,
    AgendamentoService,
  ];
  const mocks = new Map<any, any>();
  const route = {
    snapshot: {
      queryParamMap: convertToParamMap(query),
      paramMap: convertToParamMap(params),
      params,
      data,
    },
    queryParamMap: of(convertToParamMap(query)),
    paramMap: of(convertToParamMap(params)),
    params: of(params),
    queryParams: of(query),
    data: of(data),
  };
  const router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'], {
    url,
  });
  router.navigate.and.returnValue(Promise.resolve(true));
  const providers = services.map((provide) => {
    const methods = Object.getOwnPropertyNames(provide.prototype).filter(
      (name) =>
        name !== 'constructor' &&
        typeof Object.getOwnPropertyDescriptor(provide.prototype, name)
          ?.value === 'function',
    );
    const mock = jasmine.createSpyObj(provide.name, methods);
    for (const method of methods) mock[method].and.returnValue(of({}));
    mocks.set(provide, mock);
    return { provide, useValue: mock };
  });
  mocks.get(LoginService).buscarTodos.and.returnValue(of([]));
  mocks
    .get(UtilsService)
    .formatarDatas.and.callFake(
      (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`,
    );
  mocks
    .get(PdfExportService)
    .exportElementToPdf.and.returnValue(Promise.resolve());
  TestBed.configureTestingModule({
    providers: [
      ...providers,
      { provide: ActivatedRoute, useValue: route },
      { provide: Router, useValue: router },
    ],
  });
  return {
    router,
    route,
    mock: (token: any) => mocks.get(token),
    create: <T>(type: new () => T): T =>
      TestBed.runInInjectionContext(() => new type()),
  };
}
