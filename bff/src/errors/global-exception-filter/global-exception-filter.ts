import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '@utils/utils';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno no servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      message = res?.message || exception.message;
    }

    if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = 'Rota não encontrada';
    }

    const detail =
      exception instanceof Error
        ? exception.stack || exception.message
        : 'Excecao sem instancia de Error';
    logger.error(
      `GlobalExceptionFilter: ${request.method} ${request.path} status=${status}\n${detail}`,
    );

    response.status(status).json({
      timestamp: new Date().toISOString(),
      statusCode: status,
      message,
    });
  }
}
