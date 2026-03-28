import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { ProxyService } from '@services/proxy/proxy.service';

import { LoginController } from './login.controller';

describe('LoginController', () => {
  let controller: LoginController;
  let proxyService: { forward: jest.Mock };

  const req = { query: {}, headers: {} } as unknown as Request;
  const res = {} as Response;

  beforeEach(async () => {
    proxyService = {
      forward: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: ProxyService,
          useValue: proxyService,
        },
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('encaminha validarLogin com body para o backend', async () => {
    const body = { login: 'admin', senha: '123' };

    await controller.validarLogin(body, req, res);

    expect(proxyService.forward).toHaveBeenCalledWith(req, res, 'POST', '/login/validar-login', body);
  });

  it('encaminha refresh sem body para o backend', async () => {
    await controller.refresh(req, res);

    expect(proxyService.forward).toHaveBeenCalledWith(req, res, 'POST', '/login/refresh');
  });

  it('encaminha buscarPorToken para o backend', async () => {
    await controller.buscarPorToken(req, res);

    expect(proxyService.forward).toHaveBeenCalledWith(req, res, 'GET', '/login/buscar-por-token');
  });

  it('encaminha listar usando a rota correta', async () => {
    await controller.listar('1', '10', req, res);

    expect(proxyService.forward).toHaveBeenCalledWith(req, res, 'GET', '/login/listar');
  });

  it('encaminha buscarPorId com o identificador informado', async () => {
    await controller.buscarPorId('42', req, res);

    expect(proxyService.forward).toHaveBeenCalledWith(req, res, 'GET', '/login/buscar-por-id/42');
  });

  it('encaminha excluir com o identificador informado', async () => {
    await controller.excluir('42', req, res);

    expect(proxyService.forward).toHaveBeenCalledWith(req, res, 'DELETE', '/login/excluir/42');
  });
});
