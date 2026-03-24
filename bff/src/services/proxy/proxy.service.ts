import { Injectable } from '@nestjs/common';
import { environments } from '@environments/environments';
import { CustomError } from '@errors/custom-error/custom-error';
import { Request, Response } from 'express';

@Injectable()
export class ProxyService {
  private readonly baseUrl = environments.BACK_END;

  async forward(
    req: Request,
    res: Response,
    method: string,
    path: string,
    body?: unknown,
  ) {
    try {
      const targetUrl = this.buildUrl(path, req.query as Record<string, unknown>);
      const headers = this.buildHeaders(req, body);
      const init: RequestInit = { method, headers };

      if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
        init.body = JSON.stringify(body);
      }

      const backendResponse = await fetch(targetUrl, init);
      this.copySetCookieHeaders(backendResponse, res);

      const contentType = backendResponse.headers.get('content-type') ?? '';
      const payload = await this.parsePayload(backendResponse, contentType);

      if (payload === undefined) {
        return res.status(backendResponse.status).send();
      }

      if (contentType.includes('application/json')) {
        return res.status(backendResponse.status).json(payload);
      }

      return res.status(backendResponse.status).send(payload);
    } catch (error: any) {
      throw new CustomError(error.message ?? 'Erro ao comunicar com o backend', 500);
    }
  }

  private buildUrl(path: string, query: Record<string, unknown>) {
    const normalizedBase = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${normalizedBase}${normalizedPath}`);

    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, String(item)));
        return;
      }

      url.searchParams.append(key, String(value));
    });

    return url.toString();
  }

  private buildHeaders(req: Request, body?: unknown) {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (req.headers.cookie) {
      headers.cookie = req.headers.cookie;
    }

    if (req.headers.authorization) {
      headers.authorization = String(req.headers.authorization);
    }

    return headers;
  }

  private copySetCookieHeaders(backendResponse: globalThis.Response, res: Response) {
    const getSetCookie = (backendResponse.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
    const cookies = typeof getSetCookie === 'function' ? getSetCookie.call(backendResponse.headers) : [];

    if (cookies.length > 0) {
      res.setHeader('Set-Cookie', cookies);
    }
  }

  private async parsePayload(backendResponse: globalThis.Response, contentType: string) {
    if (backendResponse.status === 204) {
      return undefined;
    }

    if (contentType.includes('application/json')) {
      return backendResponse.json();
    }

    const text = await backendResponse.text();
    return text.length > 0 ? text : undefined;
  }
}
