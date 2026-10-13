import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { OrcamentoComponent } from './orcamento.component';
import { ListarComponent as CaixaComponent } from '../../caixa/listar/listar.component';
import { ComercialService } from '@services/comercial.service';
import { PdfExportService } from '@services/pdf-export.service';
import { ProdutoService } from '@services/produto.service';
import { ServicoComercialService } from '@services/servico-comercial.service';
import { ToastService } from '@services/toast.service';
import { UtilsService } from '@services/utils.service';

describe('Venda e caixa: troco', () => {
  beforeEach(() => TestBed.configureTestingModule({providers: [
    ...[ActivatedRoute,Router,ComercialService,PdfExportService,ProdutoService,ServicoComercialService,UtilsService].map(provide=>({provide,useValue:{}})),
    {provide:ToastService,useValue:jasmine.createSpyObj('ToastService',['warning'])},
  ]}));
  const venda = (total:number) => {
    const component=TestBed.runInInjectionContext(()=>new OrcamentoComponent());
    component.itens=[{valor_total:total} as any];return component;
  };
  it('envia valor entregue além do líquido para preservar o troco',()=>{
    const component=venda(80);component.pagamentosEdicao=[{forma_pagamento:'DINHEIRO',valor_informado:100}];
    expect(component['montarPagamentosVenda']()).toEqual([{forma_pagamento:'DINHEIRO',valor_pago:80,valor_entregue:100}]);
    expect(component['validarPagamentosVenda']()).toBeTrue();
  });
  it('pagamento misto aplica PIX primeiro e devolve o excedente em dinheiro',()=>{
    const component=venda(100);component.pagamentosEdicao=[{forma_pagamento:'DINHEIRO',valor_informado:100},{forma_pagamento:'PIX',valor_informado:30}];
    expect(component['montarPagamentosVenda']()).toEqual([{forma_pagamento:'PIX',valor_pago:30,valor_entregue:30},{forma_pagamento:'DINHEIRO',valor_pago:70,valor_entregue:100}]);
    expect(component.trocoPagamento).toBe(30);
  });
  it('não permite troco em PIX ou descarta dinheiro quando a venda já foi coberta',()=>{
    const component=venda(100);component.pagamentosEdicao=[{forma_pagamento:'PIX',valor_informado:120}];
    expect(component['validarPagamentosVenda']()).toBeFalse();
    component.pagamentosEdicao=[{forma_pagamento:'PIX',valor_informado:100},{forma_pagamento:'DINHEIRO',valor_informado:20}];
    expect(component['validarPagamentosVenda']()).toBeFalse();
  });
  it('conferência acompanha alterações e não gera quebra por precisão decimal',()=>{
    const component=TestBed.runInInjectionContext(()=>new CaixaComponent());
    component.valorEsperadoFechamento=.3;
    component.conferenciaPorTipo=[{forma_pagamento:'PIX',valor_informado:.1},{forma_pagamento:'DINHEIRO',valor_informado:.2}];
    expect(component.quebraCaixa()).toBe(0);component.atualizarValorConferido(0,.2);
    expect(component.valorConferido()).toBe(.4);expect(component.quebraCaixa()).toBe(.1);
  });
});
