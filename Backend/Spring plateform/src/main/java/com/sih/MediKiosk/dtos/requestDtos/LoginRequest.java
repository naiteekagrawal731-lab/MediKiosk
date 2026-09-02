package com.sih.MediKiosk.dtos.requestDtos;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginRequest {

    String username;

    String password;
}
