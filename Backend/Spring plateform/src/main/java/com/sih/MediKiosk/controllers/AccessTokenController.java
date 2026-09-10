package com.sih.MediKiosk.controllers;


import com.sih.MediKiosk.dtos.requestDtos.GetAccessTokenReq;
import com.sih.MediKiosk.dtos.responseDtos.AccessTokenResponse;
import com.sih.MediKiosk.exceptions.InvalidToken;
import com.sih.MediKiosk.services.UserAccessTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth/token")
@Slf4j
public class AccessTokenController {

    private final UserAccessTokenService userAccessTokenService;

    public AccessTokenController(UserAccessTokenService userAccessTokenService) {
        this.userAccessTokenService = userAccessTokenService;
    }

    @PostMapping
    public ResponseEntity<AccessTokenResponse> getAccessToken(@RequestBody GetAccessTokenReq req) {
        return userAccessTokenService.getAccessToken(UUID.fromString(req.getRefresh_token()));
    }

}
