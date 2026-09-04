package com.sih.MediKiosk.dtos.requestDtos;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GuestLoginRequest {
    private String username;
    private String gender;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String phoneNumber;
    private String registrationNumber;
}
