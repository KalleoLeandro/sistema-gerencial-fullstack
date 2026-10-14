import { LoginService } from '@services/login/login.service';
import * as utils from '@utils/utils';
import { CustomError } from '@errors/custom-error/custom-error';

jest.mock('@utils/utils', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('@environments/environments', () => ({
  environments: {
    BACK_END: 'http://mocked-api',
  },
}));

describe('LoginService', () => {
  let service: LoginService;
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LoginService();
    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => jest.restoreAllMocks());

  const mockLoginBody = { login: 'teste', senha: '123' };

  it('preserva os dados do usuário autenticado na validação do token', async () => {
    const response = {
      valid: true,
      userName: 'Admin',
      perfil: 'ADMIN',
      login: 'admin',
      expiration: '2026-10-13T15:00:00Z',
    };
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(response), { status: 200 }),
    );
    expect(await service.validarToken('token')).toEqual({
      ...response,
      status: 200,
    });
    expect(fetch).toHaveBeenCalledWith(
      'http://mocked-api/login/validar-token',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json', Authorization: 'token' },
      }),
    );
  });

  it('rejeita refresh expirado sem tentar ler JSON', async () => {
    const backendResponse = new Response(null, { status: 401 });
    const json = jest.spyOn(backendResponse, 'json');
    fetchMock.mockResolvedValue(backendResponse);
    const result = await service.refreshToken('expired');
    expect(result.status).toBe(401);
    expect(result.message).toEqual(expect.any(String));
    expect(json).not.toHaveBeenCalled();
  });

  it.each(['validarLogin', 'validarToken'] as const)(
    '%s converte falha de rede em CustomError',
    async (method) => {
      fetchMock.mockRejectedValue(new Error('offline'));
      await expect(
        method === 'validarLogin'
          ? service.validarLogin(mockLoginBody)
          : service.validarToken('token'),
      ).rejects.toThrow(CustomError);
    },
  );

  it('validarLogin() deve retornar LoginResponse com status 200', async () => {
    const mockResponse = {
      token: 'abc123',
      refreshToken: 'refresh123',
      expiration: '2026-03-23T12:00:00Z',
      refreshExpiration: '2026-03-23T19:00:00Z',
      userName: 'Kalleo',
      perfil: 'admin',
    };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await service.validarLogin(mockLoginBody);

    expect(result).toEqual({
      status: 200,
      token: 'abc123',
      refreshToken: 'refresh123',
      expiration: '2026-03-23T12:00:00Z',
      refreshExpiration: '2026-03-23T19:00:00Z',
      userName: 'Kalleo',
      perfil: 'admin',
      message: undefined,
    });
    expect(utils.logger.info).toHaveBeenCalledWith(
      'Executando a /api/login/validar-login',
    );
  });

  it('validarToken() deve retornar token invÃ¡lido para 401', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const result = await service.validarToken('abc');

    expect(result).toEqual({
      valid: false,
      status: 401,
    });
  });

  it('refreshToken() deve retornar novos tokens', async () => {
    const mockResponse = {
      token: 'novo-access',
      refreshToken: 'novo-refresh',
      expiration: '2026-03-23T13:00:00Z',
      refreshExpiration: '2026-03-23T20:00:00Z',
      userName: 'Kalleo',
      perfil: 'admin',
    };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await service.refreshToken('refresh');

    expect(result).toEqual({
      status: 200,
      token: 'novo-access',
      refreshToken: 'novo-refresh',
      expiration: '2026-03-23T13:00:00Z',
      refreshExpiration: '2026-03-23T20:00:00Z',
      userName: 'Kalleo',
      perfil: 'admin',
      message: undefined,
    });
  });

  it('deve lanÃ§ar CustomError em exceÃ§Ã£o', async () => {
    fetchMock.mockRejectedValue(new Error('Falha na rede'));

    await expect(service.refreshToken('abc')).rejects.toThrow(CustomError);
    expect(utils.logger.error).toHaveBeenCalledWith(
      'Erro: Error: Falha na rede',
    );
  });
});
