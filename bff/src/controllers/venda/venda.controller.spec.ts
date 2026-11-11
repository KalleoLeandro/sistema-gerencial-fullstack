import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { VendaController } from './venda.controller';

describe('VendaController HTTP contracts', () => {
  const harness = createProxyHarness(VendaController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(VendaController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
