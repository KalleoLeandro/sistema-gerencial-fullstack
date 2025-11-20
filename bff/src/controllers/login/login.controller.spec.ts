import { Test, TestingModule } from '@nestjs/testing';
import { LoginController } from './login.controller';
import { LoginService } from '@services/login/login.service';
import { Response } from 'express';
import * as utils from '@utils/utils';
import { CustomError } from '@errors/custom-error/custom-error';

describe('LoginController', () => {
  let controller: LoginController;

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  const mockReq = {    
    json: jest.fn(),
    cookies: jest.fn()
  } as any;

  const mockLoginService = {
    validarLogin: jest.fn(),
    validarToken: jest.fn()
  };

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    cookie: jest.fn()
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: LoginService,
          useValue: mockLoginService,
        },
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);

    jest.mock('@utils/utils', () => ({
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
      decriptografia: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /validar-login - deve lançar erro se o hash estiver ausente', async () => {
    const res = mockResponse();

    await expect(controller.validarLogin({ hash: '' } as any, res))
      .rejects
      .toThrow(new CustomError('Hash inválido ou ausente', 500));
  });

  it('POST /validar-login - deve lançar erro se o hash não for descriptografado', async () => {
    const res = mockResponse();
    jest.spyOn(utils, 'decriptografia').mockReturnValue('');

    await expect(controller.validarLogin({ hash: 'abc' } as any, res))
      .rejects
      .toThrow(new CustomError('Falha ao descriptografar o hash', 500));
  });

  it('POST /validar-login - deve chamar o LoginService e retornar o JSON com status correto', async () => {
    const res = mockResponse();

    const decrypted = JSON.stringify({ user: 'admin', password: '123' });
    jest.spyOn(utils, 'decriptografia').mockReturnValue(decrypted);

    const retorno = { status: 200, token: "abc", userName: 'admin', expiration: 20000, message: "Login ok" };
    mockLoginService.validarLogin.mockResolvedValue(retorno);

    await controller.validarLogin({ hash: 'validHash' } as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 200, userName: 'admin', expiration: 20000, message: "Login ok" });
    expect(res.cookie).toHaveBeenCalledWith('jwt', retorno.token, expect.any(Object));
  });

  it('POST /validar-token - deve chamar o LoginService e retornar o status válido para o token', async () => {
    const res = mockResponse();

    mockReq.cookies = { jwt: 'token123' };
    mockLoginService.validarToken.mockResolvedValue(true);

    await controller.validarToken(mockReq, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(true);
  }); 
});
