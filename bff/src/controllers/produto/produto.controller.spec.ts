import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { ProdutoController } from './produto.controller';

describe('ProdutoController HTTP contracts', () => {
  const harness = createProxyHarness(ProdutoController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(ProdutoController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
