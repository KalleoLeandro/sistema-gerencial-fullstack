import * as forge from 'node-forge';
import { decriptografia, logger } from './utils';

describe('Utils', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('decriptografia', () => {

    it('deve descriptografar com sucesso e retornar a mensagem', () => {
      const mockPrivateKey = {
        decrypt: jest.fn().mockReturnValue('mensagem descriptografada'),
      };

      jest.spyOn(forge.pki, 'privateKeyFromPem').mockReturnValue(mockPrivateKey as any);
      jest.spyOn(forge.util, 'decode64').mockReturnValue('dados decodificados' as any);

      const resultado = decriptografia('hash-falso');
      expect(resultado).toBe('mensagem descriptografada');
      expect(mockPrivateKey.decrypt).toHaveBeenCalled();
    });

    it('deve retornar null e logar erro quando falhar', () => {
      const mockError = new Error('Erro na chave');
      jest.spyOn(forge.pki, 'privateKeyFromPem').mockImplementation(() => { throw mockError; });
      const logSpy = jest.spyOn(logger, 'error').mockImplementation();

      const resultado = decriptografia('hash-invalido');

      expect(resultado).toBeNull();
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Erro ao descriptografar'));
    });
  });

  describe('logger', () => {
    it('deve registrar mensagens corretamente', () => {
      const infoSpy = jest.spyOn(logger, 'info').mockImplementation();
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();

      logger.info('Mensagem de info');
      logger.error('Mensagem de erro');

      expect(infoSpy).toHaveBeenCalledWith('Mensagem de info');
      expect(errorSpy).toHaveBeenCalledWith('Mensagem de erro');
    });
  });
});
