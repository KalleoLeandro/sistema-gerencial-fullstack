import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { AvulsoController } from './avulso.controller';

describe('AvulsoController HTTP contracts', () => {
  const harness = createProxyHarness(AvulsoController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(AvulsoController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
