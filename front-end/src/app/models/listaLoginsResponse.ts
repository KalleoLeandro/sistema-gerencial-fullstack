import { LoginDTOResponse } from "./loginDTOResponse";

export interface ListaLoginsResponse {
    lista: LoginDTOResponse[];
    total: number;
}