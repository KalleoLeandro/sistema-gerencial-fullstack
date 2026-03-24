package br.com.sistema_gerencial.exceptions;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import br.com.sistema_gerencial.exceptions.schemas.DefaultErrorResponse;

@ControllerAdvice
public class GlobalExceptionHandler {    

	/**
	 * Executa o metodo handleDefaultError.
	 * @param ex valor do parametro ex.
	 * @return resultado da operacao.
	 */
	@ExceptionHandler(DefaultErrorException.class)
    public ResponseEntity<DefaultErrorResponse> handleDefaultError(DefaultErrorException ex) {
        DefaultErrorResponse response = new DefaultErrorResponse();
        response.setTimestamp(LocalDateTime.now());
        response.setMessage(ex.getMessage());
        response.setStatus(ex.getStatus().value());

        return ResponseEntity.status(ex.getStatus()).body(response);
    }
    
    /**
     * Executa o metodo handleValidationExceptions.
     * @param ex valor do parametro ex.
     * @return resultado da operacao.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<String> invalidFields = new ArrayList<>();
        
        ex.getBindingResult().getFieldErrors().forEach((error) -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            invalidFields.add(fieldName + ": " + errorMessage);
        });
        
        ApiError apiError = new ApiError();
        apiError.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        apiError.setStatus(HttpStatus.BAD_REQUEST.value());
        apiError.setError("Bad Request");
        apiError.setMessage("Erros de validaÃ§Ã£o: " + invalidFields);     

        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }
}

