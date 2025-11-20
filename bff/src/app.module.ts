import { LoginController } from '@controllers/login/login.controller';
import { TokenMiddleware } from '@middlewares/token/token.middleware';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { LoginService } from './services/login/login.service';

@Module({
  imports: [],
  controllers: [LoginController],
  providers: [LoginService],
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenMiddleware)
      .exclude(        
        { path: 'metrics', method: RequestMethod.GET },
        { path: 'login/validar-login', method: RequestMethod.POST },
        { path: 'login/validar-token', method: RequestMethod.POST },
      )
      .forRoutes('*');
    }
}
