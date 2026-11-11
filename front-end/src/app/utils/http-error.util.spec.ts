import { getHttpErrorMessage } from './http-error.util';

describe('getHttpErrorMessage', () => {
  it('prioriza a mensagem vinda do corpo da resposta', () => {
    expect(getHttpErrorMessage({ error: { message: 'erro principal' } }, 'fallback')).toBe('erro principal');
    expect(getHttpErrorMessage({ error: { error: 'erro alternativo' } }, 'fallback')).toBe('erro alternativo');
    expect(getHttpErrorMessage({ error: { details: 'detalhes' } }, 'fallback')).toBe('detalhes');
  });

  it('usa a mensagem do erro quando nao houver payload detalhado', () => {
    expect(getHttpErrorMessage({ message: 'falha de rede' }, 'fallback')).toBe('falha de rede');
  });

  it('usa o fallback quando nao houver texto valido', () => {
    expect(getHttpErrorMessage({ error: { message: '   ' } }, 'fallback')).toBe('fallback');
    expect(getHttpErrorMessage(null, 'fallback')).toBe('fallback');
  });
});
