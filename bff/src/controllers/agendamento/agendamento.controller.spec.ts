import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { AgendamentoController } from './agendamento.controller';

describe('AgendamentoController HTTP contracts', () => {
  const harness = createProxyHarness(AgendamentoController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(AgendamentoController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
