import { LoginResponse } from '@models/interfaces/login-response';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto implements LoginResponse {
  @ApiProperty({ example: 20000 })
  expiration?: string | undefined;
  @ApiProperty({ example: 28800000, required: false })
  refreshExpiration?: string | undefined;
  @ApiProperty({ example: 200 })
  status: number;
  @ApiProperty({ example: 'User' })
  userName?: string | undefined;
  @ApiProperty({ example: 'admin', required: false })
  perfil?: string | undefined;
  @ApiProperty({ example: 'Login efetuado com sucesso' })
  message?: string;
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR...' })
  token?: string;
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR...', required: false })
  refreshToken?: string;
}
