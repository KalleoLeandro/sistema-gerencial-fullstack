import { LoginResponse } from '@models/interfaces/login-response';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto implements LoginResponse {
  @ApiProperty({ example: 20000 })
  expiration?: string | undefined;
  @ApiProperty({ example: 200 })
  status: number;
  @ApiProperty({ example: 'User' })
  userName?: string | undefined;
  @ApiProperty({ example: 'Login efetuado com sucesso' })
  message?: string;
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR...' })
  token?: string;
}