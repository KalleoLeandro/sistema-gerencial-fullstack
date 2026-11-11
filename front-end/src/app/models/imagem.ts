export interface Imagem {
  id: string;
  entityType: string;
  entityId: number;
  categoria: string;
  nomeArquivo: string;
  contentType: string;
  tamanhoBytes: number;
  principal: boolean;
  criadoEm?: string | null;
}
