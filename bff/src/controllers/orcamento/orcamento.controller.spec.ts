import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { OrcamentoController } from './orcamento.controller';

describe('OrcamentoController HTTP contracts', () => {
  const harness = createProxyHarness(OrcamentoController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(OrcamentoController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
