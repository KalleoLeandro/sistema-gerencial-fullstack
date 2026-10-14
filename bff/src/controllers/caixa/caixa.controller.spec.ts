import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { CaixaController } from './caixa.controller';

describe('CaixaController HTTP contracts', () => {
  const harness = createProxyHarness(CaixaController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(CaixaController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
