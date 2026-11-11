import { fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ImagemManagerComponent } from './imagem-manager.component';
import { ImagemService } from '@services/imagem.service';
import { ToastService } from '@services/toast.service';
import { pageSetup } from '../../testing/page.testing';

describe('Image manager', () => {
  let setup: ReturnType<typeof pageSetup>;
  let component: ImagemManagerComponent;
  let service: any;
  const image = { id: 'abc', nomeArquivo: 'photo.png' } as any;
  beforeEach(() => {
    setup = pageSetup();
    service = setup.mock(ImagemService);
    service.listar.and.returnValue(of([image]));
    component = setup.create(ImagemManagerComponent);
    component.entityType = 'PRODUTO';
    component.categoria = 'CAPA';
  });
  it('loads only when the entity is saved and relevant inputs change', () => {
    component.ngOnChanges({});
    expect(service.listar).not.toHaveBeenCalled();
    component.carregar();
    expect(component.imagens).toEqual([]);
    component.entityId = 42;
    component.ngOnChanges({ entityId: {} as any });
    expect(component.imagens).toEqual([image]);
    expect(component.carregando).toBeFalse();
    service.listar.and.returnValue(throwError(() => new Error('offline')));
    component.carregar();
    expect(component.carregando).toBeFalse();
    expect(setup.mock(ToastService).error).toHaveBeenCalled();
  });
  it('rejects upload before saving and ignores empty file selections', () => {
    component.aoSelecionarArquivos({ target: { files: null } } as any);
    expect(service.upload).not.toHaveBeenCalled();
    const input = {
      files: [new File(['image'], 'photo.png')],
      value: 'photo.png',
    };
    component.aoSelecionarArquivos({ target: input } as any);
    expect(input.value).toBe('');
    expect(setup.mock(ToastService).warning).toHaveBeenCalled();
  });
  for (const count of [1, 2])
    it(`uploads ${count} images and refreshes the list`, () => {
      component.entityId = 42;
      const input = {
        files: Array.from(
          { length: count },
          () => new File(['image'], 'photo.png'),
        ),
        value: 'files',
      };
      component.aoSelecionarArquivos({ target: input } as any);
      expect(service.upload).toHaveBeenCalledTimes(count);
      expect(service.upload).toHaveBeenCalledWith(
        jasmine.objectContaining({ entityId: 42, categoria: 'CAPA' }),
      );
      expect(component.enviando).toBeFalse();
      expect(input.value).toBe('');
      expect(service.listar).toHaveBeenCalled();
    });
  it('resets upload state on failure', () => {
    component.entityId = 42;
    service.upload.and.returnValue(
      throwError(() => ({ error: { message: 'Falha' } })),
    );
    component.aoSelecionarArquivos({
      target: { files: [new File(['image'], 'photo.png')], value: 'photo' },
    } as any);
    expect(component.enviando).toBeFalse();
    expect(setup.mock(ToastService).error).toHaveBeenCalledWith('Falha');
  });
  it('confirms deletion, refreshes on success and exposes errors', () => {
    component.entityId = 42;
    const confirm = spyOn(window, 'confirm').and.returnValue(false);
    component.excluir(image);
    expect(service.excluir).not.toHaveBeenCalled();
    confirm.and.returnValue(true);
    component.excluir(image);
    expect(service.excluir).toHaveBeenCalledWith('abc');
    service.excluir.and.returnValue(throwError(() => new Error('offline')));
    component.excluir(image);
    expect(setup.mock(ToastService).error).toHaveBeenCalled();
  });
  it('opens, scrolls and closes preview', fakeAsync(() => {
    const dialog = document.createElement('div');
    dialog.className = 'image-modal__dialog';
    document.body.append(dialog);
    const scroll = spyOn(dialog, 'scrollIntoView');
    try {
      component.abrirImagem(image);
      tick(20);
      expect(scroll).toHaveBeenCalled();
      expect(component.imagemAberta).toBe(image);
      component.fecharImagem();
      expect(component.imagemAberta).toBeNull();
      service.urlConteudo.and.returnValue('/photo');
      expect(component.urlConteudo(image)).toBe('/photo');
      dialog.remove();
      component.abrirImagem(image);
      tick(20);
    } finally {
      dialog.remove();
    }
  }));
});
