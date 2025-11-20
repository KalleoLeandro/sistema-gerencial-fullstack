import { environments } from '@environments/environments';
import { CustomError } from '@errors/custom-error/custom-error';
import { LoginResponseDto } from '@models/dto/login-reponse-dto';
import { LoginRequest } from '@models/interfaces/login-request';
import { LoginResponse } from '@models/interfaces/login-response';
import { Injectable } from '@nestjs/common';
import { logger } from '@utils/utils';

const log = logger;

@Injectable()
export class LoginService {

    async validarLogin(body: LoginRequest) {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            };

            log.info("Executando a /api/login/validar-login");
            const res = await fetch(`${environments.BACK_END}/login/validar-login`, options);
            const statusCode = res.status;
            const response: LoginResponseDto = await res.json();
            let retorno: LoginResponseDto;

            if (statusCode === 200) {
                retorno = {
                    token: response.token,
                    expiration: response.expiration,
                    userName: response.userName,
                    status: 200
                };
            } else if (statusCode === 401) {
                retorno = {
                    status: 401,
                    message: response.message
                };
            } else {

                retorno = {
                    status: 500,
                    message: response.message
                };
            }
            return retorno;
        } catch (error: any) {
            log.error(`Erro: ${error}`);
            throw new CustomError(error.message, 500);
        }
    }

    async validarToken(token: string) {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                }
            };
            log.info("Executando a /api/login/validar-token");
            let response: boolean = await fetch(`${environments.BACK_END}/login/validar-token`, options).then((res) => res.json());
            return response;
        } catch (error: any) {
            log.error(`Erro: ${error}`);
            throw new CustomError(error.message, 500);
        }
    }  
}
