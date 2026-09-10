package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.GuestLoginRequest;
import com.sih.MediKiosk.dtos.responseDtos.GuestLoginResponse;
import com.sih.MediKiosk.models.ClinicalSession;
import com.sih.MediKiosk.models.Guest;
import com.sih.MediKiosk.repos.GuestRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
public class GuestService {

    private final GuestRepo guestRepo;
    private final ClinicalSessionService clinicalSessionService;
    private final HospitalService hospitalService;

    public GuestService(GuestRepo guestRepo, ClinicalSessionService clinicalSessionService, HospitalService hospitalService) {
        this.guestRepo = guestRepo;
        this.clinicalSessionService = clinicalSessionService;
        this.hospitalService = hospitalService;
    }

    @Transactional
    public ResponseEntity<GuestLoginResponse> guestLogin(GuestLoginRequest request) {
        log.info("Registration number = {}", request.getRegistrationNumber());

        // Validate registrationNumber before attempting UUID.fromString to produce
        // a clear 400 error rather than a NullPointerException.
        String regNum = request.getRegistrationNumber();

        //Temp
        if(regNum == null){
            regNum = "644dac96-c60e-4d97-97d3-3f1089221ceb";
        }

        if (regNum == null || regNum.isBlank()) {
            log.warn("Guest login rejected: registrationNumber is null or blank");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        UUID hospitalUuid;
        try {
            hospitalUuid = UUID.fromString(regNum);
        } catch (IllegalArgumentException e) {
            log.warn("Guest login rejected: registrationNumber '{}' is not a valid UUID", regNum);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }


        Guest guest = Guest.builder()
                .name(request.getUsername())
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .bloodGroup(request.getBloodGroup())
                .gender(request.getGender())
                .build();

        // IMPORTANT: save() returns the managed entity with the DB-assigned UUID.
        // The original 'guest' reference still has id=null after save() if the ID
        // is DB-generated (@GeneratedValue). Using the un-saved reference in the
        // hospital collection causes TransientPropertyValueException on auto-flush.
        guest = guestRepo.save(guest);
        ClinicalSession clinicalSession = clinicalSessionService.crateSession(guest);

        hospitalService.addGuestToHospitalPermission(hospitalUuid, guest);

        log.info("Guest login successful. sessionId = {}", clinicalSession.getId());

        return ResponseEntity.ok().body(GuestLoginResponse.builder()
                .sessionId(clinicalSession.getId())
                .build());
    }
}
