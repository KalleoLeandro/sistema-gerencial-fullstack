import { CssGuideComponent } from './css-guide.component';
import { pageSetup } from '../../../testing/page.testing';

describe('CssGuideComponent', () => {
  it('scrolls to CSS recipes and reports clipboard failures', async () => {
    const setup = pageSetup();
    const guide: any = setup.create(CssGuideComponent);
    const section = document.createElement('div');
    section.id = 'css-demo';
    document.body.append(section);
    const scroll = spyOn(section, 'scrollIntoView');
    try {
      guide.goTo('demo');
      guide.goTo('missing');
      expect(scroll).toHaveBeenCalledTimes(1);
    } finally {
      section.remove();
    }
    const copy = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    await guide.copyCode('body {}', 'CSS');
    expect(guide.copyStatus()).toContain('copiado');
    copy.and.rejectWith(new Error('denied'));
    await guide.copyCode('', 'CSS');
    expect(guide.copyStatus()).toContain('manualmente');
  });
});
