package com.sih.MediKiosk.mappers;

import com.sih.MediKiosk.dtos.responseDtos.AdminDto;
import com.sih.MediKiosk.models.User;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper implements MapperInt<AdminDto, User>{
    @Override
    public AdminDto toDto(User user) {
        return AdminDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}
