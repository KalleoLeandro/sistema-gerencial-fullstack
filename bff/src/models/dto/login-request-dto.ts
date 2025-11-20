import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginRequestDto {  
   @ApiProperty({
    example: 'aslkdj1298nASD==',
    description: 'Hash criptografado contendo email e senha',
    required: true,
  })
  @IsString({message: 'O campo hash deve ser uma string válida'})
  hash: string;
}