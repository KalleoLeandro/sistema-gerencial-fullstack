import { environment } from "@environments/environment";
import { AuthRequest } from "@models/authRequest";
import * as forge from "node-forge";

export const criptografia = (login: AuthRequest) =>{    
    const publicKeyForge = forge.pki.publicKeyFromPem(environment.PUBLIC_KEY);
    const encryptedData = forge.util.encode64(publicKeyForge.encrypt(JSON.stringify(login)));
    return encryptedData;
}