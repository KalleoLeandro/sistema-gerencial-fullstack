import { StatusPipe } from './status.pipe';

describe('StatusPipe', () => {
  const pipe = new StatusPipe();

  it('retorna o texto esperado para status conhecidos', () => {
    expect(pipe.transform(1)).toBe('AGUARDANDO ATENDIMENTO');
    expect(pipe.transform(2)).toBe('EM ATENDIMENTO');
    expect(pipe.transform(3)).toBe('FINALIZADO');
    expect(pipe.transform(4)).toBe('CANCELADO');
  });

  it('retorna desconhecido para status nao mapeado', () => {
    expect(pipe.transform(99)).toBe('DESCONHECIDO');
  });
});
