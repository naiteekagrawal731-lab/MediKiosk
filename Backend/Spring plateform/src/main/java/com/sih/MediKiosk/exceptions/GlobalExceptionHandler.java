package com.sih.MediKiosk.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(UsernameNotFound.class)
    public ResponseEntity<String> handleUsernameNotFound(UsernameNotFound e) {
        log.warn("UsernameNotFound: {}", e.getMessage());
        return ResponseEntity.status(404).body(e.getMessage());
    }

    @ExceptionHandler(WrongPassword.class)
    public ResponseEntity<String> handleWrongPassword(WrongPassword e) {
        log.warn("WrongPassword: {}", e.getMessage());
        return ResponseEntity.status(401).body(e.getMessage());
    }

    @ExceptionHandler(InvalidToken.class)
    public ResponseEntity<String> handleInvalidToken(InvalidToken e) {
        log.warn("InvalidToken: {}", e.getMessage());
        return ResponseEntity.status(401).body(e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneric(Exception e) {
        log.error("Unhandled exception: {}", e.getMessage(), e);
        return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
    }
}
