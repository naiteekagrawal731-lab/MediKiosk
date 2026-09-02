package com.sih.MediKiosk.dtos.requestDtos;

import lombok.Data;

@Data
public class CreateHospitalRequest {
    private String hospitalName;
    private String password;
    private String address;
    private String city;
    private String state;
    private String phoneNumber;
}
