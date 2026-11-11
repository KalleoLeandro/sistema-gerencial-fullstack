import { AtendimentoController } from '@controllers/atendimento/atendimento.controller';
import { AvulsoController } from '@controllers/avulso/avulso.controller';
import { ClienteController } from '@controllers/cliente/cliente.controller';
import { EmpresaController } from '@controllers/empresa/empresa.controller';
import { EquipamentoController } from '@controllers/equipamento/equipamento.controller';
import { ImagemController } from '@controllers/imagem/imagem.controller';
import { LoginController } from '@controllers/login/login.controller';
import { ManutencaoController } from '@controllers/manutencao/manutencao.controller';
import { ProdutoController } from '@controllers/produto/produto.controller';
import { ServicoController } from '@controllers/servico/servico.controller';
import { Module } from '@nestjs/common';
import { ProxyService } from '@services/proxy/proxy.service';

@Module({
  imports: [],
  controllers: [
    LoginController,
    EmpresaController,
    EquipamentoController,
    ImagemController,
    AtendimentoController,
    AvulsoController,
    ClienteController,
    ManutencaoController,
    ProdutoController,
    ServicoController,
  ],
  providers: [ProxyService],
})
export class AppModule {}
