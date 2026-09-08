package com.sih.MediKiosk.services;


import com.sih.MediKiosk.dtos.requestDtos.RegistrationRequest;
import com.sih.MediKiosk.dtos.responseDtos.RegistrationResponse;
import com.sih.MediKiosk.models.Role;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class RegistrationService {

    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public RegistrationService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    public ResponseEntity<RegistrationResponse> register(RegistrationRequest request) {
        String username = request.getUsername();

        if (userRepository.getUserByUsername(username).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(RegistrationResponse.builder()
                            .message("Username '" + username + "' is already taken")
                            .build());
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PATIENT)
                .build();

        userRepository.save(user);
        userRepository.flush();
        log.info("User registered successfully: {}", username);

        return ResponseEntity.status(201)
                .body(RegistrationResponse.builder()
                        .message("User '" + username + "' registered successfully")
                        .build());
    }
    ResponseEntity<RegistrationResponse> register(RegistrationRequest request,Role role){
        String username = request.getUsername();

        if (userRepository.getUserByUsername(username).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(RegistrationResponse.builder()
                            .message("Username '" + username + "' is already taken")
                            .build());
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", username);
        return ResponseEntity.status(201)
                .body(RegistrationResponse.builder()
                        .message("User '" + username + "' registered successfully")
                        .build());
    }
}
