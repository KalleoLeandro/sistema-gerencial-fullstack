import { Equipamento } from "./equipamento";

export interface ListaEquipamementoResponse {
    lista: Equipamento[];
    total: number;
}