package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.CreateHospitalRequest;
import com.sih.MediKiosk.dtos.requestDtos.RegistrationRequest;
import com.sih.MediKiosk.exceptions.UsernameNotFound;
import com.sih.MediKiosk.exceptions.UsernameTaken;
import com.sih.MediKiosk.models.Hospital;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.HospitalRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
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
    @Transactional
    public ResponseEntity<?> createNewHospital(CreateHospitalRequest createHospitalRequest){
        if(userService.getUserByUsername(createHospitalRequest.getHospitalName()).isPresent()){
            throw new UsernameTaken("Hospital name = "+createHospitalRequest.getHospitalName()+" is already taken");
        }
        registrationService.register(new RegistrationRequest(createHospitalRequest.getHospitalName(), createHospitalRequest.getPassword()));
        User user = userService.getUserByUsername(createHospitalRequest.getHospitalName()).orElseThrow(() -> new UsernameNotFound(""));

        Hospital hospital = Hospital.builder()
                .user(user)
                .city(createHospitalRequest.getCity())
                .state(createHospitalRequest.getState())
                .name(createHospitalRequest.getHospitalName())
                .address(createHospitalRequest.getAddress())
                .phoneNumber(createHospitalRequest.getPhoneNumber())
                .id(UUID.randomUUID())
                .build();

        hospitalRepo.save(hospital);
        return ResponseEntity.ok("Hospital Account created successfully");

    }
}
