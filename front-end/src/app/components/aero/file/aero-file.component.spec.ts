import { AeroFileComponent } from '../index';

describe('AeroFileComponent', () => {
  it('emits selected files and an empty selection', () => {
    const file: any = new AeroFileComponent();
    const selected = jasmine.createSpy();
    file.filesSelected.subscribe(selected);
    const image = new File(['image'], 'photo.png');
    file.selectFiles({ target: { files: [image] } });
    expect(selected).toHaveBeenCalledWith([image]);
    file.selectFiles({ target: { files: null } });
    expect(selected).toHaveBeenCalledWith([]);
  });
});
