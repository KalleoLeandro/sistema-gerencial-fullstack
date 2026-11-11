import { Module } from '@nestjs/common';
import { ProxyService } from '@services/proxy/proxy.service';

@Module({
  imports: [],
  controllers: [
  ],
  providers: [ProxyService],
})
export class AppModule {}
