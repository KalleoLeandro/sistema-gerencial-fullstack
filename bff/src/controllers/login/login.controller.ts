import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { decriptografia, logger } from '@utils/utils';
import { Request, Response } from 'express';
import { environments } from '@environments/environments';
import { Logger } from 'winston';
import { LoginRequest } from '@models/interfaces/login-request';
import { LoginResponseDto } from '@models/dto/login-reponse-dto';
import { LoginRequestDto } from '@models/dto/login-request-dto';
import { CustomError } from '@errors/custom-error/custom-error';
import { LoginService } from '@services/login/login.service';

const log: Logger = logger;


@Controller()
export class LoginController {

    constructor(private readonly loginService: LoginService) { }

    @Post('validar-login')
    @ApiBody({
        description: 'Credenciais criptografadas para autenticação',
        required: true,
        type: LoginRequestDto,
    })
    @ApiOperation({ summary: 'Endpoint de autenticação' })
    @ApiResponse({
        status: 200,
        description: 'Login e/ou senha válidos',
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request',
        schema: {
            example: { message: 'Erro' },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Login e/ou senha inválidos',
        schema: {
            example: { message: "Login e/ou senha inválidos" },
        },
    })
    @ApiResponse({
        status: 500,
        description: 'Erro ao validar o login',
        schema: {
            example: { message: "Erro ao validar o login" },
        },
    })
    async validarLogin(@Body() body: LoginRequestDto, @Res() res: Response) {
        const hash: string = body.hash;

        if (!hash) {
            throw new CustomError("Hash inválido ou ausente", 500);
        }

        const decrypted = decriptografia(hash);

        if (!decrypted) {
            throw new CustomError("Falha ao descriptografar o hash", 500);
        }

        const login: LoginRequest = JSON.parse(decrypted);
        log.info("Executando a LoginService.validarLogin")
        const retorno: LoginResponseDto = await this.loginService.validarLogin(login);
        res.cookie('jwt', retorno.token, {
            httpOnly: true,
            sameSite: environments.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: environments.NODE_ENV === 'production',
        });

        return res.status(200).json({
            expiration: retorno.expiration,
            status: retorno.status,
            userName: retorno.userName,
            message: retorno.message
        });
    }

    @Post('validar-token')
    @ApiCookieAuth()
    @ApiOperation({ summary: 'Endpoint de validação de token' })
    @ApiResponse({
        status: 200,
        description: 'Token testado (pode ser true ou false)',
        schema: {
            example: true
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request',
        schema: {
            example: { message: 'Erro' },
        },
    })
    @ApiResponse({
        status: 500,
        description: 'Erro ao validar o token',
        schema: {
            example: { message: "Erro ao validar o token" },
        },
    })
    async validarToken(@Req() req: Request, @Res() res: Response) {
        const token: string = req.cookies['jwt'];
        log.info("Executando a LoginService.validarToken")
        const retorno: boolean = await this.loginService.validarToken(token);
        return res.status(200).json(retorno);
    }   
}
