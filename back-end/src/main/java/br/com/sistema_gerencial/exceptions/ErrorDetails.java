package br.com.sistema_gerencial.exceptions;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ErrorDetails {
	
    private LocalDateTime timestamp;
    private String message;
    private int statusCode;
}

