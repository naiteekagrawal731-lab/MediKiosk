package com.sih.MediKiosk.controllers;

import com.sih.MediKiosk.dtos.requestDtos.AdminUserCreationDto;
import com.sih.MediKiosk.dtos.responseDtos.AdminDto;
import com.sih.MediKiosk.services.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin")
@Slf4j
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNewAdminUser(@RequestBody AdminUserCreationDto request){
        log.info("Creating new admin with username = "+request.getUsername());
        return userService.createNewAdmin(request);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAdminById(@RequestParam UUID id){
        return userService.deleteAdmin(id);
    }

    @GetMapping("/all")
    public Page<AdminDto> findAdminByUsername(@RequestParam String username, Pageable pageable){
        return userService.findAdminByUsername(username,pageable);
    }



}

