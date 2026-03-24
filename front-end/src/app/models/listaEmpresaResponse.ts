import { Empresa } from "./empresa";

export interface ListaEmpresaResponse {
    lista: Empresa[];
    total: number;
}