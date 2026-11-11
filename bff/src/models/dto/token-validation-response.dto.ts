import { ApiProperty } from '@nestjs/swagger';
import { TokenValidationResponse } from '@models/interfaces/token-validation-response';

export class TokenValidationResponseDto implements TokenValidationResponse {
  @ApiProperty({ example: true })
  valid: boolean;

  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({ example: 'Kalleo', required: false })
  userName?: string;

  @ApiProperty({ example: 'admin', required: false })
  perfil?: string;

  @ApiProperty({ example: 'kalleo', required: false })
  login?: string;

  @ApiProperty({ example: '23/03/2026 10:00:00', required: false })
  expiration?: string;
}
