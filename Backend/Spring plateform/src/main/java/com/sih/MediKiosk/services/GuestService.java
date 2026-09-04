package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.GuestLoginRequest;
import com.sih.MediKiosk.dtos.responseDtos.GuestLoginResponse;
import com.sih.MediKiosk.models.ClinicalSession;
import com.sih.MediKiosk.models.Guest;
import com.sih.MediKiosk.repos.GuestRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
    public ResponseEntity<GuestLoginResponse> guestLogin(GuestLoginRequest request){
        ClinicalSession clinicalSession = clinicalSessionService.createSession();

        Guest guest = Guest.builder()
                .name(request.getUsername())
                .clinicalSession(clinicalSession)
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .bloodGroup(request.getBloodGroup())
                .build();
        guestRepo.save(guest);

        hospitalService.addGuestToHospitalPermission(UUID.fromString(request.getRegistrationNumber()),guest);

        return ResponseEntity.ok().body(GuestLoginResponse.builder()
                .seassionId(clinicalSession.getId())
                .build());

    }
}
