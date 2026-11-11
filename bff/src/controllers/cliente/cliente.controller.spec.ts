import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { ClienteController } from './cliente.controller';

describe('ClienteController HTTP contracts', () => {
  const harness = createProxyHarness(ClienteController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(ClienteController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
