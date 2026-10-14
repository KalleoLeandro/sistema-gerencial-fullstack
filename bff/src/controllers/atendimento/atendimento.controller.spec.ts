import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { AtendimentoController } from './atendimento.controller';

describe('AtendimentoController HTTP contracts', () => {
  const harness = createProxyHarness(AtendimentoController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(AtendimentoController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
