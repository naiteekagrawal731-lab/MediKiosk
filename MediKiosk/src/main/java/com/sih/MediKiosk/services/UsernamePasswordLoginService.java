package com.sih.MediKiosk.services;


import com.sih.MediKiosk.dtos.requestDtos.LoginRequest;
import com.sih.MediKiosk.exceptions.UsernameNotFound;
import com.sih.MediKiosk.models.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class UsernamePasswordLoginService {

    private final UserRefreshTokenService userRefreshTokenService;
    private final UserService userService;
    private final HttpServletResponse response;

    public UsernamePasswordLoginService(UserRefreshTokenService userRefreshTokenService,
                                        UserService userService,
                                        HttpServletResponse response) {
        this.userRefreshTokenService = userRefreshTokenService;
        this.userService = userService;
        this.response = response;
    }

    public ResponseEntity<String> login(LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();

        log.info("Getting user info for: {}", username);

        User user = userService.getUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFound("User with username = " + username + " does not exist"));

        log.info("Authenticating user: {}", username);
        userService.authenticateUser(user, password);

        log.info("Generating refresh token for user: {}", username);
        UUID refreshToken = userRefreshTokenService.generateRefreshToken(user);

        Cookie refreshTokenCookie = new Cookie("refresh_token", String.valueOf(refreshToken));
        refreshTokenCookie.setPath("/**");
        refreshTokenCookie.setMaxAge(3600 * 24 * 30); // 30 days
        refreshTokenCookie.setHttpOnly(true);

        response.addCookie(refreshTokenCookie);

        log.info("Login successful for user: {}", username);
        return ResponseEntity.ok("Login Successful");
    }
}
