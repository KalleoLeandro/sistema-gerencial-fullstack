import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environments } from '@environments/environments';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from '@utils/utils';
import { Logger } from 'winston';
import * as cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from '@errors/global-exception-filter/global-exception-filter';
import { corsOptions } from './cors-options';

const log: Logger = logger;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('BFF Sistema Gerencial Fullstack')
    .setDescription('Documentacao dos endpoints expostos pelo BFF para autenticacao, dashboard e operacoes do sistema.')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
  });

  SwaggerModule.setup('api-docs', app, document);

  app.enableCors(corsOptions(process.env.ALLOWED_ORIGINS));

  await app.listen(environments.PORT || 3000, () => {
    log.info(`Servidor rodando na porta ${environments.PORT}`);
  });
}

bootstrap();
