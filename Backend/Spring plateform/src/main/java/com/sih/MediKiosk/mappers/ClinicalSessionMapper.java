package com.sih.MediKiosk.mappers;

import com.sih.MediKiosk.dtos.responseDtos.ClinicalSessionDto;
import com.sih.MediKiosk.models.ClinicalSession;
import org.springframework.stereotype.Component;

@Component
public class ClinicalSessionMapper implements MapperInt<ClinicalSessionDto, ClinicalSession> {
    @Override
    public ClinicalSessionDto toDto(ClinicalSession clinicalSession) {
        return ClinicalSessionDto.builder()
                .id(clinicalSession.getId())
                .createdAt(clinicalSession.getCreatedAt())
                .summary(clinicalSession.getSummary())
                .build();
    }
}
