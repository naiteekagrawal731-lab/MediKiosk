package com.sih.MediKiosk.exceptions;

public class UsernameTaken extends RuntimeException {
    public UsernameTaken(String message) {
        super(message);
    }
}
