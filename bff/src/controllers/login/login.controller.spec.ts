import { Test, TestingModule } from '@nestjs/testing';
import { LoginController } from './login.controller';
import { LoginService } from '@services/login/login.service';
import { Response } from 'express';
import * as utils from '@utils/utils';
import { CustomError } from '@errors/custom-error/custom-error';
import { UnauthorizedException } from '@nestjs/common';

describe('LoginController', () => {
  let controller: LoginController;

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  const mockLoginService = {
    validarLogin: jest.fn(),
    validarToken: jest.fn(),
    refreshToken: jest.fn()
  };

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /auth/login - deve lanÃ§ar erro se o hash estiver ausente', async () => {
    const res = mockResponse();

    await expect(controller.validarLogin({ hash: '' } as any, res))
      .rejects
      .toThrow(new CustomError('Hash invÃ¡lido ou ausente', 500));
  });

  it('POST /auth/login - deve lanÃ§ar erro se o hash nÃ£o for descriptografado', async () => {
    const res = mockResponse();
    jest.spyOn(utils, 'decriptografia').mockReturnValue('');

    await expect(controller.validarLogin({ hash: 'abc' } as any, res))
      .rejects
      .toThrow(new CustomError('Falha ao descriptografar o hash', 500));
  });

  it('POST /auth/login - deve chamar o LoginService e setar cookies', async () => {
    const res = mockResponse();
    const decrypted = JSON.stringify({ login: 'admin', senha: '123' });
    jest.spyOn(utils, 'decriptografia').mockReturnValue(decrypted);

    mockLoginService.validarLogin.mockResolvedValue({
      status: 200,
      token: 'access',
      refreshToken: 'refresh',
      userName: 'admin',
      perfil: 'admin',
      expiration: '2026-03-23 10:00:00',
      refreshExpiration: '2026-03-23 17:00:00'
    });

    await controller.validarLogin({ hash: 'validHash' } as any, res);

    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 200,
      userName: 'admin',
      perfil: 'admin'
    }));
  });

  it('GET /auth/me - deve retornar a sessÃ£o atual', async () => {
    const res = mockResponse();
    const req = { user: { valid: true, status: 200, userName: 'admin', perfil: 'admin' } } as any;

    await controller.me(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ valid: true }));
  });

  it('POST /auth/refresh - deve renovar tokens', async () => {
    const res = mockResponse();
    const req = { cookies: { refresh_token: 'refresh123' } } as any;
    mockLoginService.refreshToken.mockResolvedValue({
      status: 200,
      token: 'novo-access',
      refreshToken: 'novo-refresh',
      userName: 'admin',
      perfil: 'admin'
    });

    await controller.refresh(req, res);

    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('POST /auth/refresh - deve rejeitar refresh invÃ¡lido', async () => {
    const res = mockResponse();
    const req = { cookies: { refresh_token: 'refresh123' } } as any;
    mockLoginService.refreshToken.mockResolvedValue({ status: 401 });

    await expect(controller.refresh(req, res)).rejects.toThrow(UnauthorizedException);
    expect(res.clearCookie).toHaveBeenCalledTimes(2);
  });
});
