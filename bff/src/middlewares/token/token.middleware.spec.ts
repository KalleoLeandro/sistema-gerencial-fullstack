import { UnauthorizedException } from '@nestjs/common';
import { TokenMiddleware } from './token.middleware';

describe('TokenMiddleware', () => {
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
