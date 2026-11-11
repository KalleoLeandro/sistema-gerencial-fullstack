import { Manutencao } from "./manutencao";

export interface ListaManutencaoResponse {
    lista: Manutencao[];
    total: number;
}