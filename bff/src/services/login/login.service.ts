import { Injectable } from '@nestjs/common';
import { environments } from '@environments/environments';
import { CustomError } from '@errors/custom-error/custom-error';
import { LoginResponseDto } from '@models/dto/login-reponse-dto';
import { TokenValidationResponseDto } from '@models/dto/token-validation-response.dto';
import { LoginRequest } from '@models/interfaces/login-request';
import { logger } from '@utils/utils';

const log = logger;

@Injectable()
export class LoginService {

    async validarLogin(body: LoginRequest): Promise<LoginResponseDto> {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            };

            log.info('Executando a /api/login/validar-login');
            const res = await fetch(`${environments.BACK_END}/login/validar-login`, options);
            const response: LoginResponseDto = await res.json();

            return {
                status: res.status,
                token: response.token,
                refreshToken: response.refreshToken,
                expiration: response.expiration,
                refreshExpiration: response.refreshExpiration,
                userName: response.userName,
                perfil: response.perfil,
                message: response.message
            };
        } catch (error: any) {
            log.error(`Erro: ${error}`);
            throw new CustomError(error.message, 500);
        }
    }

    async validarToken(token: string): Promise<TokenValidationResponseDto> {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token
                }
            };

            log.info('Executando a /api/login/validar-token');
            const res = await fetch(`${environments.BACK_END}/login/validar-token`, options);

            if (res.status === 401) {
                return {
                    valid: false,
                    status: 401
                };
            }

            const response: TokenValidationResponseDto = await res.json();
            return {
                valid: response.valid,
                status: res.status,
                userName: response.userName,
                perfil: response.perfil,
                login: response.login,
                expiration: response.expiration
            };
        } catch (error: any) {
            log.error(`Erro: ${error}`);
            throw new CustomError(error.message, 500);
        }
    }

    async refreshToken(token: string): Promise<LoginResponseDto> {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token
                }
            };

            log.info('Executando a /api/login/refresh-token');
            const res = await fetch(`${environments.BACK_END}/login/refresh-token`, options);

            if (res.status === 401) {
                return {
                    status: 401,
                    message: 'Refresh token invÃ¡lido'
                };
            }

            const response: LoginResponseDto = await res.json();
            return {
                status: res.status,
                token: response.token,
                refreshToken: response.refreshToken,
                expiration: response.expiration,
                refreshExpiration: response.refreshExpiration,
                userName: response.userName,
                perfil: response.perfil,
                message: response.message
            };
        } catch (error: any) {
            log.error(`Erro: ${error}`);
            throw new CustomError(error.message, 500);
        }
    }
}
