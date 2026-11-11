import { LoginController } from '@controllers/login/login.controller';
import { ProdutoController } from '@controllers/produto/produto.controller';
import { Module } from '@nestjs/common';
import { ProxyService } from '@services/proxy/proxy.service';

@Module({
  imports: [],
  controllers: [
    LoginController,
    ProdutoController,
  ],
  providers: [ProxyService],
})
export class AppModule {}
