import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { ServicoController } from './servico.controller';

describe('ServicoController HTTP contracts', () => {
  const harness = createProxyHarness(ServicoController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(ServicoController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
