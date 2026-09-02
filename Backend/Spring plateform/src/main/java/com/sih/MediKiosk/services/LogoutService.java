package com.sih.MediKiosk.services;


import com.sih.MediKiosk.exceptions.InvalidToken;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.UserRefreshTokenRepo;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class LogoutService {

    private final UserRefreshTokenService userRefreshTokenService;

    public LogoutService(UserRefreshTokenService userRefreshTokenService) {
        this.userRefreshTokenService = userRefreshTokenService;
    }

    public ResponseEntity<String> logout(HttpServletResponse response, HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return ResponseEntity.ok("Already logged out");
        }

        Optional<Cookie> refreshTokenCookie = Arrays.stream(cookies)
                .filter(c -> c.getName().equals("refresh_token"))
                .findFirst();

        if (refreshTokenCookie.isPresent()) {
            try {
                UUID refreshToken = UUID.fromString(refreshTokenCookie.get().getValue());
                userRefreshTokenService.deleteRefreshToken(refreshToken);
                log.info("Refresh token deleted successfully");
            } catch (Exception e) {
                log.warn("Could not delete refresh token: {}", e.getMessage());
            }
        }

        // Clear the cookie
        org.springframework.http.ResponseCookie expiredCookie = org.springframework.http.ResponseCookie
                .from("refresh_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, expiredCookie.toString());

        return ResponseEntity.ok("Logged out successfully");
    }
}
