package com.sih.MediKiosk.dtos.requestDtos;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetAccessTokenReq {
    String refresh_token;
}
