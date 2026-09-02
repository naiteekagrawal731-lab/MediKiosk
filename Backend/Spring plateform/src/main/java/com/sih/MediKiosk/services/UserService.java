package com.sih.MediKiosk.services;


import com.sih.MediKiosk.exceptions.UsernameNotFound;
import com.sih.MediKiosk.exceptions.WrongPassword;
import com.sih.MediKiosk.dtos.requestDtos.ChangePasswordRequest;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Slf4j
public class UserService {

    private final UserRepo userRepository;
    // Used independently to avoid bean resolution circular dependency
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserByUsername(String username) {
        return userRepository.getUserByUsername(username);
    }

    public ResponseEntity<String> changeUserPassword(ChangePasswordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.getUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFound("User with username = " + username + " does not exist"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("User = " + username + " password updated successfully");
        return ResponseEntity.accepted().body("User password changed successfully");
    }

    public void authenticateUser(User user, String password) {
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new WrongPassword("Password given by the user is wrong");
        }
    }

    @Transactional
    public void updateUser(User user) {
        userRepository.save(user);
    }

}
