import { LoginController } from '@controllers/login/login.controller';
import { ProdutoController } from '@controllers/produto/produto.controller';
import { ServicoController } from '@controllers/servico/servico.controller';
import { Module } from '@nestjs/common';
import { ProxyService } from '@services/proxy/proxy.service';

@Module({
  imports: [],
  controllers: [
    LoginController,
    ProdutoController,
    ServicoController,
  ],
  providers: [ProxyService],
})
export class AppModule {}
