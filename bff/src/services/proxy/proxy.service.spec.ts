import { ProxyService } from './proxy.service';
import { CustomError } from '@errors/custom-error/custom-error';
jest.mock('@environments/environments', () => ({ environments: { BACK_END: 'http://backend/' } }));

describe('ProxyService', () => {
  let service: ProxyService;
  let res: any;
  const req = (query: any = {}, headers: any = {}) => ({ query, headers }) as any;
  beforeEach(() => {
    service = new ProxyService();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis(), setHeader: jest.fn() };
    jest.spyOn(global, 'fetch');
  });
  afterEach(() => jest.restoreAllMocks());
  function response(body: BodyInit | null, status = 200, headers: any = {}) {
    jest.mocked(fetch).mockResolvedValue(new Response(body, { status, headers }));
  }
  it('serializes repeated query parameters, JSON and authentication headers', async () => {
    response('{"id":42}', 201, { 'content-type': 'application/json', 'set-cookie': 'session=abc', 'cache-control': 'no-store' });
    await service.forward(req({ page: 2, tags: ['a', 'b'], empty: '', missing: undefined, nil: null }, { cookie: 'access_token=a', authorization: 'Bearer a', accept: 'application/json' }), res, 'POST', 'produtos', { nome: 'A' });
    expect(fetch).toHaveBeenCalledWith('http://backend/produtos?page=2&tags=a&tags=b', {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', cookie: 'access_token=a', authorization: 'Bearer a' }, body: '{"nome":"A"}'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 42 });
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', ['session=abc']);
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });
  it.each(['GET', 'DELETE'])('%s never forwards a request body', async method => {
    response(null, 204);
    await service.forward(req(), res, method, '/items', {});
    expect(jest.mocked(fetch).mock.calls[0][1]?.body).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith();
  });
  it('preserves binary contents and download headers', async () => {
    response(new Uint8Array([0, 255, 42]), 200, { 'content-type': 'image/png', 'content-disposition': 'attachment; filename=a.png' });
    await service.forward(req(), res, 'GET', '/image');
    expect(res.send).toHaveBeenCalledWith(Buffer.from([0, 255, 42]));
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=a.png');
  });
  it('handles an empty response without content type or cookie API', async () => {
    jest.mocked(fetch).mockResolvedValue({ status: 200, headers: { get: () => null }, arrayBuffer: async () => new ArrayBuffer(0) } as any);
    await service.forward(req(undefined), res, 'GET', '/empty');
    expect(res.send).toHaveBeenCalledWith();
    expect(res.setHeader).not.toHaveBeenCalled();
  });
  it.each([400, 401, 404, 500])('preserves backend error %i and payload', async status => {
    response('{"message":"failure"}', status, { 'content-type': 'application/json' });
    await service.forward(req(), res, 'GET', '/items');
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({ message: 'failure' });
  });
  it.each([new Error('offline'), {}])('wraps communication failures', async error => {
    jest.mocked(fetch).mockRejectedValue(error);
    await expect(service.forward(req(), res, 'GET', '/items')).rejects.toBeInstanceOf(CustomError);
    await expect(service.forwardMultipart(req(), res, '/upload', {})).rejects.toBeInstanceOf(CustomError);
  });
  it('uploads file bytes and nonempty fields without forcing a multipart boundary', async () => {
    response('{"id":"image"}', 201, { 'content-type': 'application/json' });
    await service.forwardMultipart(req(), res, '/upload', { entityId: '42', blank: '', absent: undefined, nil: null as any }, { buffer: Buffer.from([1, 2]), mimetype: 'image/png', originalname: 'a.png' });
    const init = jest.mocked(fetch).mock.calls[0][1]!;
    const form = init.body as FormData;
    expect(form.get('entityId')).toBe('42');
    expect(form.has('blank')).toBe(false);
    expect(form.has('absent')).toBe(false);
    expect(form.has('nil')).toBe(false);
    expect((form.get('arquivo') as File).name).toBe('a.png');
    expect(Buffer.from(await (form.get('arquivo') as File).arrayBuffer())).toEqual(Buffer.from([1, 2]));
    expect(init.headers).toEqual({ Accept: 'application/json' });
    expect(res.json).toHaveBeenCalledWith({ id: 'image' });
  });
  it.each([204, 200])('handles multipart empty/binary response %i without a file', async status => {
    response(status === 204 ? null : 'ok', status);
    await service.forwardMultipart(req(), res, '/upload', undefined as any);
    if (status === 204) expect(res.send).toHaveBeenCalledWith();
    else expect(res.send).toHaveBeenCalledWith(Buffer.from('ok'));
  });
});
