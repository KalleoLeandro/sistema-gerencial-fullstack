import type { IncomingHttpHeaders } from 'node:http';
import type { Request, Response } from 'express';

/** Minimal Express doubles for the methods exercised by proxy and filter tests. */
export function createRequestMock(
  query: Record<string, unknown> = {},
  headers: IncomingHttpHeaders = {},
): Request {
  return { query, headers } as unknown as Request;
}

export function createResponseMock() {
  const mocks = {
    status: jest.fn<Response, [number]>(),
    json: jest.fn<Response, [unknown]>(),
    send: jest.fn<Response, [unknown?]>(),
    setHeader: jest.fn<
      Response,
      [string, string | number | readonly string[]]
    >(),
    end: jest.fn<Response, []>(),
  };
  const response = mocks as unknown as Response;
  mocks.status.mockReturnValue(response);
  mocks.json.mockReturnValue(response);
  mocks.send.mockReturnValue(response);
  mocks.setHeader.mockReturnValue(response);
  mocks.end.mockReturnValue(response);
  return { ...mocks, response };
}
