import type { ArgumentsHost } from '@nestjs/common';
import { HttpException, NotFoundException } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception-filter';
import { logger } from '@utils/utils';

jest.mock('@utils/utils', () => ({
  logger: { error: jest.fn() },
}));

describe('GlobalExceptionFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-10-13T15:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());
  it.each([
    [new Error('secret'), 500, 'Erro interno no servidor'],
    [new HttpException({ message: 'Invalid' }, 422), 422, 'Invalid'],
    [new HttpException('Forbidden', 403), 403, 'Forbidden'],
    [new NotFoundException(), 404, 'Rota não encontrada'],
  ])('returns a consistent error envelope', (error, status, message) => {
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    new GlobalExceptionFilter().catch(error, {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({
          method: 'POST',
          path: '/vendas',
          originalUrl: '/vendas?token=secret-token',
          headers: { authorization: 'Bearer secret-token' },
        }),
      }),
    } as unknown as ArgumentsHost);
    expect(response.status).toHaveBeenCalledWith(status);
    expect(response.json).toHaveBeenCalledWith({
      timestamp: '2026-10-13T15:00:00.000Z',
      statusCode: status,
      message,
    });
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(
        `GlobalExceptionFilter: POST /vendas status=${status}`,
      ),
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(error.stack!),
    );
    expect(JSON.stringify(jest.mocked(logger.error).mock.calls)).not.toContain(
      'secret-token',
    );
  });

  it.each([null, Object.assign(new Error('Sem stack'), { stack: undefined })])(
    'logs exceptions without a stack',
    (error) => {
      const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      new GlobalExceptionFilter().catch(error, {
        switchToHttp: () => ({
          getResponse: () => response,
          getRequest: () => ({ method: 'GET', path: '/vendas' }),
        }),
      } as unknown as ArgumentsHost);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          error instanceof Error
            ? 'Sem stack'
            : 'Excecao sem instancia de Error',
        ),
      );
      expect(response.status).toHaveBeenCalledWith(500);
    },
  );
});
