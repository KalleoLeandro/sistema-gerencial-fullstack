import { Atendimento } from "./atendimento";
import { Manutencao } from "./manutencao";

export interface ListaAtendimentoResponse {
    lista: Atendimento[];
    total: number;
}