import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environments } from '@environments/environments';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from '@utils/utils';
import { Logger } from 'winston';
import * as cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from '@errors/global-exception-filter/global-exception-filter';

const log:Logger = logger;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);  

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('API de Teste')
    .setDescription('Documentação gerada pelo Swagger')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
  });

  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  await app.listen(environments.PORT || 3000, () => {
    log.info(`Servidor rodando na porta ${environments.PORT}`)
  });
}
bootstrap();
