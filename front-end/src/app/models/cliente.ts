export interface Cliente {
  id: number;
  nome: string;
  documento: string;
  cep?: string | null;
  endereco?: string | null;
  numero?: number | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  telefone?: string | null;
  celular?: string | null;
  email?: string | null;
  contato?: string | null;
  criado_em?: string;
  atualizado_em?: string;
}
