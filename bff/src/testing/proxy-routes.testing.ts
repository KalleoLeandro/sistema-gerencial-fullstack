import * as request from 'supertest';
import 'reflect-metadata';
import type { Server } from 'node:http';
import type { Request } from 'express';
import { Test } from '@nestjs/testing';
import { INestApplication, RequestMethod, Type } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { ProxyService } from '@services/proxy/proxy.service';

type HttpMethod =
  'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
interface ProxyRouteCase {
  method: HttpMethod;
  path: string;
}

/** Shared Nest fixture; each controller declares its suite in its own spec. */
export function proxyRouteCases(controller: Type<unknown>): ProxyRouteCase[] {
  const prototype = controller.prototype as Record<string, unknown>;
  return Object.getOwnPropertyNames(prototype)
    .filter(
      (name) =>
        typeof prototype[name] === 'function' &&
        Reflect.hasMetadata(METHOD_METADATA, prototype[name] as object),
    )
    .map((name) => {
      const handler = prototype[name] as object;
      const requestMethod = Reflect.getMetadata(
        METHOD_METADATA,
        handler,
      ) as RequestMethod;
      const method = RequestMethod[requestMethod] as HttpMethod;
      const prefix = Reflect.getMetadata(PATH_METADATA, controller) as string;
      const route = Reflect.getMetadata(PATH_METADATA, handler) as string;
      const path =
        '/' +
        [prefix, route]
          .filter(Boolean)
          .join('/')
          .replace(/:origem/g, 'MANUAL')
          .replace(/:[\w]+/g, '42');
      return { method, path };
    });
}

function expectCredentials(req: Request): void {
  expect(req.headers.cookie).toBe('access_token=demo');
  expect(req.headers.authorization).toBe('Bearer demo');
  expect(req.query).toEqual({
    pesquisa: 'nome com espa?o',
    page: '2',
    limit: '25',
  });
}

export function createProxyHarness(controller: Type<unknown>) {
  let app: INestApplication;
  const proxy = {
    forward: jest.fn<
      ReturnType<ProxyService['forward']>,
      Parameters<ProxyService['forward']>
    >(),
    forwardMultipart: jest.fn<
      ReturnType<ProxyService['forwardMultipart']>,
      Parameters<ProxyService['forwardMultipart']>
    >(),
  };
  return {
    start: async () => {
      const module = await Test.createTestingModule({
        controllers: [controller],
        providers: [{ provide: ProxyService, useValue: proxy }],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    },
    stop: async () => {
      await app.close();
    },
    reset: () => {
      jest.clearAllMocks();
      proxy.forward.mockImplementation((_req, res) =>
        Promise.resolve(res.status(200).json({ forwarded: true })),
      );
      proxy.forwardMultipart.mockImplementation((_req, res) =>
        Promise.resolve(res.status(200).json({ forwarded: true })),
      );
    },
    exercise: async ({ method, path }: ProxyRouteCase) => {
      const client = request(app.getHttpServer() as Server);
      const factories = {
        GET: () => client.get(path),
        POST: () => client.post(path),
        PUT: () => client.put(path),
        DELETE: () => client.delete(path),
        PATCH: () => client.patch(path),
        HEAD: () => client.head(path),
        OPTIONS: () => client.options(path),
      };
      let call = factories[method]()
        .set('Cookie', 'access_token=demo')
        .set('Authorization', 'Bearer demo')
        .query({ pesquisa: 'nome com espa?o', page: '2', limit: '25' });
      const payload = { nome: 'Teste', valor: 125 };
      if (path === '/imagens/upload')
        call = call
          .field('entityType', 'PRODUTO')
          .attach('arquivo', Buffer.from('image'), 'photo.png');
      else if (['POST', 'PUT'].includes(method)) call = call.send(payload);
      await call.expect(200, { forwarded: true });
      if (path === '/imagens/upload') {
        const args = proxy.forwardMultipart.mock.calls[0];
        expectCredentials(args[0]);
        expect(args[2]).toBe(path);
        expect(args[3]).toEqual({ entityType: 'PRODUTO' });
        expect(args[4]?.buffer).toEqual(Buffer.from('image'));
      } else {
        const args = proxy.forward.mock.calls[0];
        expectCredentials(args[0]);
        expect(args[2]).toBe(method);
        expect(args[3]).toBe(path);
        if (args.length === 5)
          expect(args[4]).toEqual(path.endsWith('/cancelar') ? {} : payload);
      }
    },
  };
}
