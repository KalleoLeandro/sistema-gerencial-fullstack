import { Injectable } from '@nestjs/common';
import { environments } from '@environments/environments';
import { CustomError } from '@errors/custom-error/custom-error';
import { Request, Response } from 'express';
import { logger } from '@utils/utils';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

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
    logger.info(`ProxyService.forward: ${method} ${path}`);
    try {
      const targetUrl = this.buildUrl(
        path,
        req.query as Record<string, unknown>,
      );
      const headers = this.buildHeaders(req, body);
      const init: RequestInit = { method, headers };

      if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
        init.body = JSON.stringify(body);
      }

      const backendResponse = await fetch(targetUrl, init);
      this.copySetCookieHeaders(backendResponse, res);
      this.copyResponseHeaders(backendResponse, res);

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
      throw new CustomError(
        error.message ?? 'Erro ao comunicar com o backend',
        500,
      );
    }
  }

  private buildUrl(path: string, query: Record<string, unknown>) {
    const normalizedBase = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
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
      Accept: req.headers.accept
        ? String(req.headers.accept)
        : 'application/json',
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

  async forwardMultipart(
    req: Request,
    res: Response,
    path: string,
    fields: Record<string, string | undefined>,
    arquivo?: UploadedImageFile,
  ) {
    logger.info(`ProxyService.forwardMultipart: POST ${path}`);
    try {
      const targetUrl = this.buildUrl(
        path,
        req.query as Record<string, unknown>,
      );
      const headers = this.buildHeaders(req);
      const formData = new FormData();

      Object.entries(fields ?? {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return;
        }

        formData.append(key, String(value));
      });

      if (arquivo) {
        const arquivoBytes = Uint8Array.from(arquivo.buffer);
        formData.append(
          'arquivo',
          new Blob([arquivoBytes], { type: arquivo.mimetype }),
          arquivo.originalname,
        );
      }

      const backendResponse = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: formData,
      });

      this.copySetCookieHeaders(backendResponse, res);
      this.copyResponseHeaders(backendResponse, res);

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
      throw new CustomError(
        error.message ?? 'Erro ao comunicar com o backend',
        500,
      );
    }
  }

  private copySetCookieHeaders(
    backendResponse: globalThis.Response,
    res: Response,
  ) {
    const getSetCookie = (
      backendResponse.headers as Headers & { getSetCookie?: () => string[] }
    ).getSetCookie;
    const cookies =
      typeof getSetCookie === 'function'
        ? getSetCookie.call(backendResponse.headers)
        : [];

    if (cookies.length > 0) {
      res.setHeader('Set-Cookie', cookies);
    }
  }

  private copyResponseHeaders(
    backendResponse: globalThis.Response,
    res: Response,
  ) {
    const contentType = backendResponse.headers.get('content-type');
    const contentDisposition = backendResponse.headers.get(
      'content-disposition',
    );
    const cacheControl = backendResponse.headers.get('cache-control');

    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    if (contentDisposition) {
      res.setHeader('Content-Disposition', contentDisposition);
    }

    if (cacheControl) {
      res.setHeader('Cache-Control', cacheControl);
    }
  }

  private async parsePayload(
    backendResponse: globalThis.Response,
    contentType: string,
  ) {
    if (backendResponse.status === 204) {
      return undefined;
    }

    if (contentType.includes('application/json')) {
      return backendResponse.json();
    }

    const arrayBuffer = await backendResponse.arrayBuffer();
    return arrayBuffer.byteLength > 0 ? Buffer.from(arrayBuffer) : undefined;
  }
}
