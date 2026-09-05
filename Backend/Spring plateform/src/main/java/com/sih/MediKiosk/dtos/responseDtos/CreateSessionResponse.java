package com.sih.MediKiosk.dtos.responseDtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateSessionResponse {
    private String sessionId;
}
