import { LoginService } from '@services/login/login.service';
import { LoginRequest } from '@models/interfaces/login-request';
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

  const mockLoginBody: LoginRequest = { user: 'teste', password: '123' } as any;  


  it('validarLogin() deve retornar LoginResponse com status 200', async () => {
    const mockResponse = {
      token: 'abc123',
      expiration: '2025-10-15T00:00:00Z',
      userName: 'Kalleo',
    };

    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => mockResponse,
    });

    const result = await service.validarLogin(mockLoginBody);

    expect(result).toEqual({
      token: 'abc123',
      expiration: '2025-10-15T00:00:00Z',
      userName: 'Kalleo',
      status: 200,
    });
    expect(utils.logger.info).toHaveBeenCalledWith(
      'Executando a /api/login/validar-login'
    );
  });

  it('validarLogin() deve retornar LoginResponse com status 401', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 401,
      json: async () => ({ message: 'Credenciais inválidas' }),
    });

    const result = await service.validarLogin(mockLoginBody);

    expect(result).toEqual({
      status: 401,
      message: 'Credenciais inválidas',
    });
  });

  it('validarLogin() deve retornar LoginResponse com status 500 para erro genérico', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 500,
      json: async () => ({ message: 'Erro interno' }),
    });

    const result = await service.validarLogin(mockLoginBody);

    expect(result).toEqual({
      status: 500,
      message: 'Erro interno',
    });
  });

  it('validarLogin() deve lançar CustomError em exceção', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Falha na rede'));

    await expect(service.validarLogin(mockLoginBody)).rejects.toThrow(CustomError);
    expect(utils.logger.error).toHaveBeenCalledWith('Erro: Error: Falha na rede');
  });

  it('validarToken() deve retornar boolean true', async () => {
    const token = 'abc';

    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => (true),
    });

    const result = await service.validarToken(token);

    expect(result).toEqual(true);
  });

  it('validarToken() deve lançar um CustomError', async () => {
    const token = 'abc';
    (fetch as jest.Mock).mockRejectedValue(new Error('Falha na rede'));

    await expect(service.validarToken(token)).rejects.toThrow(CustomError);
    expect(utils.logger.error).toHaveBeenCalledWith('Erro: Error: Falha na rede');
  });  
});
