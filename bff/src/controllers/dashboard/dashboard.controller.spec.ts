import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { DashboardController } from './dashboard.controller';

describe('DashboardController HTTP contracts', () => {
  const harness = createProxyHarness(DashboardController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(DashboardController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
