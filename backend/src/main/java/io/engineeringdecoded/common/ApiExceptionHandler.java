package io.engineeringdecoded.common;
import java.time.Instant;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestControllerAdvice
public class ApiExceptionHandler {
  record ErrorResponse(Instant timestamp,int status,String error,Map<String,String> fields){}
  @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException ex){var fields=new LinkedHashMap<String,String>();ex.getBindingResult().getFieldErrors().forEach(e->fields.putIfAbsent(e.getField(),e.getDefaultMessage()));return ResponseEntity.badRequest().body(new ErrorResponse(Instant.now(),400,"Validation failed",fields));}
  @ExceptionHandler(ResponseStatusException.class) ResponseEntity<ErrorResponse> status(ResponseStatusException ex){return ResponseEntity.status(ex.getStatusCode()).body(new ErrorResponse(Instant.now(),ex.getStatusCode().value(),ex.getReason(),Map.of()));}
}
