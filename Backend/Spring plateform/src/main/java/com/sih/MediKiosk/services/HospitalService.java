package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.CreateHospitalRequest;
import com.sih.MediKiosk.dtos.requestDtos.RegistrationRequest;
import com.sih.MediKiosk.dtos.responseDtos.RegistrationNumberResponse;
import com.sih.MediKiosk.exceptions.UsernameNotFound;
import com.sih.MediKiosk.exceptions.UsernameTaken;
import com.sih.MediKiosk.models.*;
import com.sih.MediKiosk.repos.HospitalRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
public class HospitalService {

    private final HospitalRepo hospitalRepo;
    private final UserService userService;
    private final RegistrationService registrationService;

    public HospitalService(HospitalRepo hospitalRepo, UserService userService, RegistrationService registrationService) {
        this.hospitalRepo = hospitalRepo;
        this.userService = userService;
        this.registrationService = registrationService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createNewHospital(CreateHospitalRequest createHospitalRequest){
        if(userService.getUserByUsername(createHospitalRequest.getHospitalName()).isPresent()){
            throw new UsernameTaken("Hospital name = "+createHospitalRequest.getHospitalName()+" is already taken");
        }
        registrationService.register(new RegistrationRequest(createHospitalRequest.getHospitalName(), createHospitalRequest.getPassword()),Role.HOSPITAL);
        User user = userService.getUserByUsername(createHospitalRequest.getHospitalName()).orElseThrow(() -> new UsernameNotFound(""));

        Hospital hospital = Hospital.builder()
                .user(user)
                .city(createHospitalRequest.getCity())
                .state(createHospitalRequest.getState())
                .name(createHospitalRequest.getHospitalName())
                .address(createHospitalRequest.getAddress())
                .phoneNumber(createHospitalRequest.getPhoneNumber())
                .build();

        hospitalRepo.save(hospital);
        return ResponseEntity.ok("Hospital Account created successfully");

    }

    public ResponseEntity<RegistrationNumberResponse> getRegistrationNumber(){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserByUsername(username).orElseThrow(() -> new UsernameNotFound("User with username = "+username+" does not exist"));

        Hospital hospital =  hospitalRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Not a valid hospital account"));
        log.info("Successfully got the hospital {}", hospital.getUser().getUsername());
        return ResponseEntity.ok(RegistrationNumberResponse.builder()
                        .registrationNumber(hospital.getRegistrationNumber().toString())
                .build());
    }
    Hospital getHospitalFromUsername(String username){
        User user = userService.getUserByUsername(username).orElseThrow(() -> new UsernameNotFound("User with username = "+username+" does not exist"));

        return hospitalRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Not a valid hospital account"));
    }

    void addGuestToHospitalPermission(UUID registrationNumber, Guest guest){
        Hospital hospital = hospitalRepo.findByRegistrationNumber(registrationNumber).orElseThrow(() -> new RuntimeException("Invalid registration number"));
        hospital.getGuests().add(guest);

        hospitalRepo.save(hospital);
    }
    void addUserToHospitalPermission(UUID registrationNumber, Patient patient){
        Hospital hospital = hospitalRepo.findByRegistrationNumber(registrationNumber).orElseThrow(() -> new RuntimeException("Invalid registration number"));
        hospital.getPatients().add(patient);

        hospitalRepo.save(hospital);
    }
    boolean hasSessionAccess(UUID hospitalId,String sesssionId){
        return true;
        //return hospitalRepo.hasSession(hospitalId,sesssionId);
    }
    

}
