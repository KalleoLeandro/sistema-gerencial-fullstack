import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { FinanceiroController } from './financeiro.controller';

describe('FinanceiroController HTTP contracts', () => {
  const harness = createProxyHarness(FinanceiroController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(FinanceiroController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
