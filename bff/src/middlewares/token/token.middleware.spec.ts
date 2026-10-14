import { UnauthorizedException } from '@nestjs/common';
import { TokenMiddleware } from './token.middleware';

describe('TokenMiddleware', () => {
  it('bloqueia tokens expirados e não chama next', async () => {
    const next = jest.fn();
    const service = { validarToken: jest.fn().mockResolvedValue({ valid: false, status: 401 }) };
    await expect(new TokenMiddleware(service as any).use({ cookies: { access_token: 'expired' } } as any, {} as any, next)).rejects.toThrow(UnauthorizedException);
    expect(service.validarToken).toHaveBeenCalledWith('expired');
    expect(next).not.toHaveBeenCalled();
  });
  it('bloqueia requisições sem cookies', async () => {
    const service = { validarToken: jest.fn() };
    await expect(new TokenMiddleware(service as any).use({} as any, {} as any, jest.fn())).rejects.toThrow(UnauthorizedException);
    expect(service.validarToken).not.toHaveBeenCalled();
  });
  it('deve permitir a requisiÃ§Ã£o quando o token for vÃ¡lido', async () => {
    const loginService = {
      validarToken: jest.fn().mockResolvedValue({ valid: true, status: 200 })
    } as any;
    const middleware = new TokenMiddleware(loginService);
    const next = jest.fn();

    await middleware.use({ cookies: { access_token: 'token' } } as any, {} as any, next);

    expect(next).toHaveBeenCalled();
  });

  it('deve bloquear a requisiÃ§Ã£o sem token', async () => {
    const loginService = { validarToken: jest.fn() } as any;
    const middleware = new TokenMiddleware(loginService);

    await expect(middleware.use({ cookies: {} } as any, {} as any, jest.fn()))
      .rejects
      .toThrow(UnauthorizedException);
  });
});
