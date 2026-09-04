package com.sih.MediKiosk.services;

import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class RandomIdGenerater {

    String generate(){
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder id = new StringBuilder(8);

        Random random = new Random();

        for (int i = 0; i < 8; i++) {
            id.append(chars.charAt(random.nextInt(chars.length())));
        }

        return id.toString();
    }
}
