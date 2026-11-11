import {
  createProxyHarness,
  proxyRouteCases,
} from '../../testing/proxy-routes.testing';
import { ImagemController } from './imagem.controller';

describe('ImagemController HTTP contracts', () => {
  const harness = createProxyHarness(ImagemController);
  beforeAll(harness.start);
  afterAll(harness.stop);
  beforeEach(harness.reset);
  it.each(proxyRouteCases(ImagemController))(
    '$method $path preserves routing, credentials and query',
    harness.exercise,
  );
});
