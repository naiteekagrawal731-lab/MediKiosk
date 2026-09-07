package com.sih.MediKiosk.dtos.responseDtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Data
public class ClinicalSessionDto {
    private String id;
    private String summary;
    private LocalDateTime createdAt;

}
