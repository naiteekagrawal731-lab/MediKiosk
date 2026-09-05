package com.sih.MediKiosk.dtos.requestDtos;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class GetSessionRequest {
    private String sessionId;
}
