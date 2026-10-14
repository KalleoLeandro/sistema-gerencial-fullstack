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

global.fetch = jest.fn();

describe('LoginService', () => {
  let service: LoginService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LoginService();
  });

  const mockLoginBody = { login: 'teste', senha: '123' };

  it('preserva os dados do usuário autenticado na validação do token', async () => {
    const response = { valid: true, userName: 'Admin', perfil: 'ADMIN', login: 'admin', expiration: '2026-10-13T15:00:00Z' };
    (fetch as jest.Mock).mockResolvedValue({ status: 200, json: async () => response });
    expect(await service.validarToken('token')).toEqual({ ...response, status: 200 });
    expect(fetch).toHaveBeenCalledWith('http://mocked-api/login/validar-token', expect.objectContaining({ headers: { 'Content-Type': 'application/json', Authorization: 'token' } }));
  });

  it('rejeita refresh expirado sem tentar ler JSON', async () => {
    const json = jest.fn();
    (fetch as jest.Mock).mockResolvedValue({ status: 401, json });
    expect(await service.refreshToken('expired')).toEqual({ status: 401, message: expect.any(String) });
    expect(json).not.toHaveBeenCalled();
  });

  it.each(['validarLogin', 'validarToken'] as const)('%s converte falha de rede em CustomError', async method => {
    (fetch as jest.Mock).mockRejectedValue(new Error('offline'));
    await expect((service[method] as any)(method === 'validarLogin' ? mockLoginBody : 'token')).rejects.toThrow(CustomError);
  });

  it('validarLogin() deve retornar LoginResponse com status 200', async () => {
    const mockResponse = {
      token: 'abc123',
      refreshToken: 'refresh123',
      expiration: '2026-03-23T12:00:00Z',
      refreshExpiration: '2026-03-23T19:00:00Z',
      userName: 'Kalleo',
      perfil: 'admin',
    };

    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => mockResponse,
    });

    const result = await service.validarLogin(mockLoginBody);

    expect(result).toEqual({
      status: 200,
      token: 'abc123',
      refreshToken: 'refresh123',
      expiration: '2026-03-23T12:00:00Z',
      refreshExpiration: '2026-03-23T19:00:00Z',
      userName: 'Kalleo',
      perfil: 'admin',
      message: undefined
    });
    expect(utils.logger.info).toHaveBeenCalledWith('Executando a /api/login/validar-login');
  });

  it('validarToken() deve retornar token invÃ¡lido para 401', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 401,
      json: async () => ({})
    });

    const result = await service.validarToken('abc');

    expect(result).toEqual({
      valid: false,
      status: 401
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

    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => mockResponse,
    });

    const result = await service.refreshToken('refresh');

    expect(result).toEqual({
      status: 200,
      token: 'novo-access',
      refreshToken: 'novo-refresh',
      expiration: '2026-03-23T13:00:00Z',
      refreshExpiration: '2026-03-23T20:00:00Z',
      userName: 'Kalleo',
      perfil: 'admin',
      message: undefined
    });
  });

  it('deve lanÃ§ar CustomError em exceÃ§Ã£o', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Falha na rede'));

    await expect(service.refreshToken('abc')).rejects.toThrow(CustomError);
    expect(utils.logger.error).toHaveBeenCalledWith('Erro: Error: Falha na rede');
  });
});
