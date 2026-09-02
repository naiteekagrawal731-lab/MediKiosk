package com.sih.MediKiosk.dtos.responseDtos;


import com.sih.MediKiosk.models.Role;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AdminDto {
    private UUID id;
    private String username;
    private Role role = Role.ADMIN;
}
