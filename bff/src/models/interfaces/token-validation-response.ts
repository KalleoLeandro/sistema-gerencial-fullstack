export interface TokenValidationResponse {
  valid: boolean;
  status: number;
  userName?: string;
  perfil?: string;
  login?: string;
  expiration?: string;
}
