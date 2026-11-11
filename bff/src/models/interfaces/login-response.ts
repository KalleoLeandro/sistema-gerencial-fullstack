export interface LoginResponse { 
    token?: string,
    refreshToken?: string,
    expiration?: string,
    refreshExpiration?: string,
    status: number,
    message?: string,
    userName?: string,
    perfil?: string
}
