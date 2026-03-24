export interface Empresa {
    id: number;
    nome_fantasia: string;
    razao_social: string;
    cnpj?: string;
    inscricao?: string;
    infraestrutura?: string;    
    contato?: string;
    data_inicio: Date;
    data_fim: Date;                
    cep?: string;
    endereco?: string;
    numero?: number;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    telefone?: string;
    celular?: string;
    email?: string;    
}