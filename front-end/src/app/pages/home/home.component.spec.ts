import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  it('exposes operational highlights', () => {
    expect((new HomeComponent() as any).highlights.length).toBe(3);
  });
});
