package com.sih.MediKiosk.dtos.requestDtos;

import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChangePasswordRequest {

    private String newPassword;
}
