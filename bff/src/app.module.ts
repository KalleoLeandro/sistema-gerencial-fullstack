import { FinanceiroController } from '@controllers/financeiro/financeiro.controller';
import { AtendimentoController } from '@controllers/atendimento/atendimento.controller';
import { AgendamentoController } from '@controllers/agendamento/agendamento.controller';
import { AvulsoController } from '@controllers/avulso/avulso.controller';
import { ClienteController } from '@controllers/cliente/cliente.controller';
import { EmpresaController } from '@controllers/empresa/empresa.controller';
import { EquipamentoController } from '@controllers/equipamento/equipamento.controller';
import { ImagemController } from '@controllers/imagem/imagem.controller';
import { LoginController } from '@controllers/login/login.controller';
import { ManutencaoController } from '@controllers/manutencao/manutencao.controller';
import { OrcamentoController } from '@controllers/orcamento/orcamento.controller';
import { ProdutoController } from '@controllers/produto/produto.controller';
import { ServicoController } from '@controllers/servico/servico.controller';
import { VendaController } from '@controllers/venda/venda.controller';
import { Module } from '@nestjs/common';
import { ProxyService } from '@services/proxy/proxy.service';

@Module({
  imports: [],
  controllers: [
    FinanceiroController,
    LoginController,
    EmpresaController,
    EquipamentoController,
    ImagemController,
    AtendimentoController,
    AgendamentoController,
    AvulsoController,
    ClienteController,
    ManutencaoController,
    ProdutoController,
    ServicoController,
    OrcamentoController,
    VendaController,
  ],
  providers: [ProxyService],
})
export class AppModule {}
