import { LoginController } from '@controllers/login/login.controller';
import { Module } from '@nestjs/common';
import { ProxyService } from '@services/proxy/proxy.service';

@Module({
  imports: [],
  controllers: [
    LoginController,
  ],
  providers: [ProxyService],
})
export class AppModule {}
