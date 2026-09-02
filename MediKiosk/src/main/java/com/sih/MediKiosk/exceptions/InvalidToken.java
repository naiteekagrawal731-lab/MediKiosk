package com.sih.MediKiosk.exceptions;

public class InvalidToken extends RuntimeException {
    public InvalidToken(String message) {
        super(message);
    }
}
