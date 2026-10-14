import { HttpException, NotFoundException } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception-filter';

describe('GlobalExceptionFilter', () => {
  beforeEach(() => { jest.useFakeTimers().setSystemTime(new Date('2026-10-13T15:00:00Z')); });
  afterEach(() => jest.useRealTimers());
  it.each([
    [new Error('secret'), 500, 'Erro interno no servidor'],
    [new HttpException({ message: 'Invalid' }, 422), 422, 'Invalid'],
    [new HttpException('Forbidden', 403), 403, 'Forbidden'],
    [new NotFoundException(), 404, 'Rota não encontrada'],
  ])('returns a consistent error envelope', (error, status, message) => {
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    new GlobalExceptionFilter().catch(error, { switchToHttp: () => ({ getResponse: () => response }) } as any);
    expect(response.status).toHaveBeenCalledWith(status);
    expect(response.json).toHaveBeenCalledWith({ timestamp: '2026-10-13T15:00:00.000Z', statusCode: status, message });
  });
});
