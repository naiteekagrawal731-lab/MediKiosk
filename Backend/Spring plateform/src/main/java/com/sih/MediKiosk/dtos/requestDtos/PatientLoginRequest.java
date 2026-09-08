package com.sih.MediKiosk.dtos.requestDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientLoginRequest {
    private String registrationNumber;
    private String username;
    private String password;
}
