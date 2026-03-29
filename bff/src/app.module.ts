import { AtendimentoController } from '@controllers/atendimento/atendimento.controller';
import { AgendamentoController } from '@controllers/agendamento/agendamento.controller';
import { AvulsoController } from '@controllers/avulso/avulso.controller';
import { DashboardController } from '@controllers/dashboard/dashboard.controller';
import { EmpresaController } from '@controllers/empresa/empresa.controller';
import { EquipamentoController } from '@controllers/equipamento/equipamento.controller';
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
    LoginController,
    EmpresaController,
    EquipamentoController,
    AtendimentoController,
    AgendamentoController,
    AvulsoController,
    ManutencaoController,
    DashboardController,
    ProdutoController,
    ServicoController,
    OrcamentoController,
    VendaController,
  ],
  providers: [ProxyService],
})
export class AppModule {}
