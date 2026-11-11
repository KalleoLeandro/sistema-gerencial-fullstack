import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { EmpresaController } from './empresa.controller';

describe('EmpresaController HTTP contracts', () => {
  const harness = createProxyHarness(EmpresaController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(EmpresaController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
