import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { ManutencaoController } from './manutencao.controller';

describe('ManutencaoController HTTP contracts', () => {
  const harness = createProxyHarness(ManutencaoController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(ManutencaoController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
