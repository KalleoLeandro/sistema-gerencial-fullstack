package br.com.sistema_gerencial.exceptions.schemas;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Define o contrato de resposta utilizado para erros da API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DefaultErrorResponse {
    
    private LocalDateTime timestamp;
    private String message;
    private int status;
}

