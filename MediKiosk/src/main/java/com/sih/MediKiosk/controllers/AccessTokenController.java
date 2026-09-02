package com.sih.MediKiosk.controllers;


import com.sih.MediKiosk.dtos.responseDtos.AccessTokenResponse;
import com.sih.MediKiosk.exceptions.InvalidToken;
import com.sih.MediKiosk.services.UserAccessTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("api/auth/token")
@Slf4j
public class AccessTokenController {

    private final UserAccessTokenService userAccessTokenService;

    public AccessTokenController(UserAccessTokenService userAccessTokenService) {
        this.userAccessTokenService = userAccessTokenService;
    }

    @GetMapping
    public ResponseEntity<AccessTokenResponse> getAccessToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            throw new InvalidToken("No cookies present — please log in first");
        }

        Optional<Cookie> refreshToken = Arrays.stream(cookies)
                .filter(c -> c.getName().equals("refresh_token"))
                .findFirst();

        if (refreshToken.isEmpty()) {
            throw new InvalidToken("Refresh token is not present");
        }

        return userAccessTokenService.getAccessToken(UUID.fromString(refreshToken.get().getValue()));
    }

}
