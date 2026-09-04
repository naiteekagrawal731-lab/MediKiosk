package com.sih.MediKiosk.dtos.requestDtos;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreatePatientRequest {
    private String username;
    private String password;
    private String gender;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String phoneNumber;
}
