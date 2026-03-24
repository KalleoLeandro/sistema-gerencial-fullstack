export interface Manutencao {
    id: number;
    id_equipamento: number;
    data_inicio: Date;
    data_fim: Date;
    tipo_servico: string;
    tipo_atendimento: string;
    valor_servico: number;
    descricao: string;
    executores: string;
    status_atendimento: number;
    motivo_cancelamento: string;
    observacoes?: string;
}
