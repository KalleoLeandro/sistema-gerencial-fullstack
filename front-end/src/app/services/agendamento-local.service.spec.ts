import { AgendamentoLocalService } from './agendamento-local.service';

describe('Local appointment persistence', () => {
  let service: AgendamentoLocalService;
  const key = 'agenda-agendamentos-locais';
  beforeEach(() => {
    localStorage.removeItem(key);
    service = new AgendamentoLocalService();
    spyOn(Date, 'now').and.returnValue(42);
  });
  afterEach(() => localStorage.removeItem(key));
  it('recovers empty, malformed and nonarray storage contents', () => {
    expect(service.listar()).toEqual([]);
    for (const text of ['invalid', '{}', 'null']) {
      localStorage.setItem(key, text);
      expect(service.listar()).toEqual([]);
    }
  });
  it('creates, edits, finds and removes related appointments', () => {
    const form = {
      titulo: ' Visita ',
      tipoTarefa: 'Entrega',
      data: new Date(2026, 9, 13, 2),
      detalhes: ' Cliente ',
    };
    const created = service.salvar(form);
    expect(created.referenciaId).toBe(42);
    expect(created.titulo).toBe('Visita');
    expect(new Date(created.dataEvento).getHours()).toBe(12);
    expect(service.existe(42)).toBeTrue();
    expect(service.existe(99)).toBeFalse();
    expect(service.buscarPorId(42)).toEqual(created);
    localStorage.setItem(
      key,
      JSON.stringify([created, { ...created, referenciaId: 99 }]),
    );
    service.salvar({ ...form, titulo: 'Atualizado' }, 42);
    expect(service.buscarPorId(42)!.titulo).toBe('Atualizado');
    expect(service.listar().length).toBe(2);
    expect(service.paraFormulario(created).detalhes).toBe('Cliente');
    expect(service.paraFormulario({} as any)).toEqual({
      titulo: '',
      tipoTarefa: '',
      data: null,
      detalhes: '',
    });
    service.remover(42);
    expect(service.existe(42)).toBeFalse();
    expect(service.existe(99)).toBeTrue();
    expect(() => service.salvar({ ...form, data: null })).toThrowError();
  });
});
