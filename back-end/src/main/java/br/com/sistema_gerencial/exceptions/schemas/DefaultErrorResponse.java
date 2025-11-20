package br.com.sistema_gerencial.exceptions.schemas;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Schema(description = "Resposta padrão de erro da API")
public class DefaultErrorResponse {

    @Schema(example = "2025-04-19T10:15:30", description = "Data e hora em que o erro ocorreu")
    private LocalDateTime timestamp;

    @Schema(example = "Erro interno do servidor", description = "Mensagem explicando o erro")
    private String message;

    @Schema(example = "500", description = "Código HTTP do erro")
    private int status;
}