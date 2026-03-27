import { AtendimentoController } from '@controllers/atendimento/atendimento.controller';
import { AgendamentoController } from '@controllers/agendamento/agendamento.controller';
import { AvulsoController } from '@controllers/avulso/avulso.controller';
import { DashboardController } from '@controllers/dashboard/dashboard.controller';
import { EmpresaController } from '@controllers/empresa/empresa.controller';
import { EquipamentoController } from '@controllers/equipamento/equipamento.controller';
import { LoginController } from '@controllers/login/login.controller';
import { ManutencaoController } from '@controllers/manutencao/manutencao.controller';
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
  ],
  providers: [ProxyService],
})
export class AppModule {}
