package com.sih.MediKiosk.dtos.requestDtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientLoginRequest {
    private String registrationNumber;
    private String username;
    private String password;
}
