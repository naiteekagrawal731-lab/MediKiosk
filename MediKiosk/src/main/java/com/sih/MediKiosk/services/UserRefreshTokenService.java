package com.sih.MediKiosk.services;


import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.models.UserRefreshToken;
import com.sih.MediKiosk.repos.UserRefreshTokenRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class UserRefreshTokenService {

    private final UserRefreshTokenRepo userRefreshTokenRepository;

    public UserRefreshTokenService(UserRefreshTokenRepo userRefreshTokenRepository) {
        this.userRefreshTokenRepository = userRefreshTokenRepository;
    }
    UUID generateRefreshToken(User user){
        Optional<UserRefreshToken> refreshToken = userRefreshTokenRepository.findByUser(user);
        UserRefreshToken token;
        if(refreshToken.isEmpty()){
            token = UserRefreshToken.builder()
                    .token(UUID.randomUUID())
                    .user(user)
                    .build();
        }else{
            token = refreshToken.get();
        }
        userRefreshTokenRepository.save(token);
        log.info("Refresh token for user = "+user.getUsername()+" created successfully");
        return token.getToken();
    }

    boolean isRefreshTokenValid(UUID refreshToken){
        Optional<UserRefreshToken> userRefreshToken =  userRefreshTokenRepository.findByToken(refreshToken);

        if(!userRefreshToken.isEmpty()){
            return userRefreshToken.get().getExpiryAt().isAfter(Instant.now());
        }
        return false;
    }

    User getUserByRefreshToken(UUID refreshToken){
        User user = userRefreshTokenRepository.findByToken(refreshToken).get().getUser();

        return user;
    }

    void deleteRefreshToken(UUID refreshToken){

        userRefreshTokenRepository.deleteByUser(getUserByRefreshToken(refreshToken));
    }
}
