package com.sih.MediKiosk.services;


import com.sih.MediKiosk.dtos.requestDtos.AdminUserCreationDto;
import com.sih.MediKiosk.dtos.responseDtos.AdminDto;
import com.sih.MediKiosk.exceptions.UsernameNotFound;
import com.sih.MediKiosk.exceptions.WrongPassword;
import com.sih.MediKiosk.dtos.requestDtos.ChangePasswordRequest;
import com.sih.MediKiosk.mappers.AdminMapper;
import com.sih.MediKiosk.models.Role;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class UserService {

    private final UserRepo userRepository;
    // Used independently to avoid bean resolution circular dependency
    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepo userRepository, AdminMapper adminMapper) {
        this.userRepository = userRepository;
        this.adminMapper = adminMapper;
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
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> createNewAdmin(AdminUserCreationDto request){
        if(userRepository.getUserByUsername(request.getUsername()).isPresent()){
            return ResponseEntity.status(409).body("Username alreaddy taken");
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .build();
        userRepository.save(user);
        return ResponseEntity.status(201).body("User created successfully");
    }
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteAdmin(UUID id){
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Invalid user id"));

        userRepository.delete(user);
        return ResponseEntity.status(201).body("User deleted successfully");
    }
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Page<AdminDto> findAdminByUsername(String username, Pageable pageable){
        return userRepository.findByUsernameContainingIgnoreCaseAndRole(username,Role.ADMIN,pageable).map(adminMapper::toDto);
    }

}
