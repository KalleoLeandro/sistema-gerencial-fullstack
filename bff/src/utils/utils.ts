import { createLogger, format, transports } from "winston";
import * as forge from "node-forge";
import { environments } from "@environments/environments";

export const decriptografia = (hash: string) => {
    const privateKeyString = environments.PRIVATE_KEY

    try {
        const privateKey = forge.pki.privateKeyFromPem(privateKeyString);
        const mensagem = privateKey.decrypt(forge.util.decode64(hash));
        return mensagem;
    } catch (error) {
        logger.error("Erro ao descriptografar");
        return null;
    }
}

const customFormat = format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

export const logger: any = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        customFormat
    ),
    transports: [

        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
                customFormat
            )
        }),

        new transports.File({
            filename: 'logs/application.log',
            format: format.combine(
                format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
                customFormat
            )
        })
    ]
});