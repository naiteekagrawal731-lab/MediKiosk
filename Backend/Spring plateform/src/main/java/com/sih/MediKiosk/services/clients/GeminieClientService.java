package com.sih.MediKiosk.services.clients;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.*;

@Service
@Slf4j
public class GeminieClientService {

    private final WebClient geminiWebClient;
    private final String apiKey;

    public GeminieClientService(WebClient.Builder builder,@Value("${gemini.api.key}") String apiKey){
        geminiWebClient = builder
                .baseUrl("https://generativelanguage.googleapis.com/v1")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.apiKey = apiKey;
    }




}
