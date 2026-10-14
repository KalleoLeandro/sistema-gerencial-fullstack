import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { LoginService } from '@services/login/login.service';
import { createResponseMock } from '../../testing/http.testing';
import { TokenMiddleware } from './token.middleware';

const requestWithCookies = (cookies?: Record<string, string>): Request =>
  ({ cookies }) as unknown as Request;
function setup() {
  const validarToken = jest.fn<
    ReturnType<LoginService['validarToken']>,
    Parameters<LoginService['validarToken']>
  >();
  const service = { validarToken } as unknown as LoginService;
  return {
    validarToken,
    middleware: new TokenMiddleware(service),
    next: jest.fn(),
    response: createResponseMock().response,
  };
}

describe('TokenMiddleware', () => {
  it('bloqueia tokens expirados e n?o chama next', async () => {
    const { validarToken, middleware, next, response } = setup();
    validarToken.mockResolvedValue({ valid: false, status: 401 });
    await expect(
      middleware.use(
        requestWithCookies({ access_token: 'expired' }),
        response,
        next,
      ),
    ).rejects.toThrow(UnauthorizedException);
    expect(validarToken).toHaveBeenCalledWith('expired');
    expect(next).not.toHaveBeenCalled();
  });
  it('bloqueia requisi??es sem cookies', async () => {
    const { validarToken, middleware, next, response } = setup();
    await expect(
      middleware.use(requestWithCookies(), response, next),
    ).rejects.toThrow(UnauthorizedException);
    expect(validarToken).not.toHaveBeenCalled();
  });
  it('permite a requisi??o quando o token ? v?lido', async () => {
    const { validarToken, middleware, next, response } = setup();
    validarToken.mockResolvedValue({ valid: true, status: 200 });
    await middleware.use(
      requestWithCookies({ access_token: 'token' }),
      response,
      next,
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
  it('bloqueia a requisi??o sem token', async () => {
    const { middleware, next, response } = setup();
    await expect(
      middleware.use(requestWithCookies({}), response, next),
    ).rejects.toThrow(UnauthorizedException);
  });
});
