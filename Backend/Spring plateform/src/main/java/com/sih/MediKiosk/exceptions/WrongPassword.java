package com.sih.MediKiosk.exceptions;

public class WrongPassword extends RuntimeException {
    public WrongPassword(String message) {
        super(message);
    }
}
