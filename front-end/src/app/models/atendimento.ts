export interface Atendimento {
    id: number;
    id_empresa: number;    
    data_inicio: Date;
    data_fim: Date;
    solicitante: string;
    executores: string;
    valor_servico: number;
    tipo_atendimento: string;
    status_atendimento: number;
    motivo_cancelamento: string;
    descricao: string;
    observacoes?: string;
}
