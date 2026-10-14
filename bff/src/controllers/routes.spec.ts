import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication, RequestMethod } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { ProxyService } from '@services/proxy/proxy.service';
import request from 'supertest';
import { readdirSync } from 'fs';
import { join } from 'path';

// Exercise the public HTTP contract, including Nest parameter binding and multipart parsing.
const controllers = readdirSync(__dirname, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && entry.name !== 'metrics')
  .flatMap(entry => Object.values(require(join(__dirname, entry.name, `${entry.name}.controller`)))) as any[];
const routes = controllers.flatMap(controller =>
  Object.getOwnPropertyNames(controller.prototype)
    .filter(name => Reflect.hasMetadata(METHOD_METADATA, controller.prototype[name]))
    .map(name => {
      const handler = controller.prototype[name];
      const method = RequestMethod[Reflect.getMetadata(METHOD_METADATA, handler)];
      const path = '/' + [Reflect.getMetadata(PATH_METADATA, controller), Reflect.getMetadata(PATH_METADATA, handler)]
        .filter(Boolean).join('/').replace(/:origem/g, 'MANUAL').replace(/:[\w]+/g, '42');
      return { method, path };
    }));

describe('Public proxy routes', () => {
  let app: INestApplication;
  const proxy = { forward: jest.fn(), forwardMultipart: jest.fn() };
  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers, providers: [{ provide: ProxyService, useValue: proxy }] }).compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app.close(); });
  beforeEach(() => {
    jest.clearAllMocks();
    proxy.forward.mockImplementation((_req, res) => res.status(200).json({ forwarded: true }));
    proxy.forwardMultipart.mockImplementation((_req, res) => res.status(200).json({ forwarded: true }));
  });

  it.each(routes)('$method $path preserves routing, credentials and query', async ({ method, path }) => {
    let call = (request(app.getHttpServer()) as any)[method.toLowerCase()](path)
      .set('Cookie', 'access_token=demo').set('Authorization', 'Bearer demo')
      .query({ pesquisa: 'nome com espaço', page: '2', limit: '25' });
    const payload = { nome: 'Teste', valor: 125 };
    if (path === '/imagens/upload') call = call.field('entityType', 'PRODUTO').attach('arquivo', Buffer.from('image'), 'photo.png');
    else if (['POST', 'PUT'].includes(method)) call = call.send(payload);
    await call.expect(200, { forwarded: true });
    const args = (path === '/imagens/upload' ? proxy.forwardMultipart : proxy.forward).mock.calls[0];
    expect(args[0].headers.cookie).toBe('access_token=demo');
    expect(args[0].headers.authorization).toBe('Bearer demo');
    expect(args[0].query).toEqual({ pesquisa: 'nome com espaço', page: '2', limit: '25' });
    if (path === '/imagens/upload') {
      expect(args[2]).toBe(path);
      expect(args[3]).toEqual({ entityType: 'PRODUTO' });
      expect(args[4].buffer).toEqual(Buffer.from('image'));
    } else {
      expect(args[2]).toBe(method);
      expect(args[3]).toBe(path);
      if (args.length === 5) expect(args[4]).toEqual(path.endsWith('/cancelar') ? {} : payload);
    }
  });
});
