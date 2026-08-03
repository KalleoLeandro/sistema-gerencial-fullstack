export interface Empresa {
    id: number;
    tipo_cadastro?: string;
    tipo_pessoa?: string;
    nome_cliente?: string;
    nome_fantasia: string;
    razao_social: string;
    cpf_cnpj?: string;
    cnpj?: string;
    documento?: string;
    ie?: string;
    inscricao?: string;
    possui_contrato?: boolean;
    teve_contrato?: boolean;
    infraestrutura?: string;
    contato?: string;
    data_inicio?: Date | string | null;
    data_fim?: Date | string | null;
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
