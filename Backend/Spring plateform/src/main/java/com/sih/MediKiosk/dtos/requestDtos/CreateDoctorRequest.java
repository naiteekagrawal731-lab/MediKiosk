package com.sih.MediKiosk.dtos.requestDtos;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateDoctorRequest {
    private String username;
    private String password;
    private String licenseNumber;
    private String specialization;
    private String qualification;
}
