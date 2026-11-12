import { corsOptions } from './cors-options';

describe('corsOptions', () => {
  it('uses local origins when no environment configuration is supplied', () => {
    expect(corsOptions().origin).toEqual(['http://localhost:4200', 'http://127.0.0.1:4200']);
  });

  it('uses only the configured origins with credentials', () => {
    const options = corsOptions(' https://lealinformatica.com.br, https://www.lealinformatica.com.br, ');
    expect(options.origin).toEqual(['https://lealinformatica.com.br', 'https://www.lealinformatica.com.br']);
    expect(options.credentials).toBe(true);
    expect(options.origin).not.toContain('*');
    expect(options.origin).not.toContain('https://outro.example');
  });
});
