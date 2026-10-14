import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { EquipamentoController } from './equipamento.controller';

describe('EquipamentoController HTTP contracts', () => {
  const harness = createProxyHarness(EquipamentoController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(EquipamentoController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
