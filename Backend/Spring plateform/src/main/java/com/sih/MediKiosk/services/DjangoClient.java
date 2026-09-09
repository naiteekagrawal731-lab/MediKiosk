package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.responseDtos.ClinicalSessionSummaryDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import tools.jackson.databind.JsonNode;

@Service
public class DjangoClient {
    private final WebClient webClient;

    public DjangoClient(WebClient.Builder builder,
                      @Value("${django.api.key}") String apiKey) {

        this.webClient = builder
                .baseUrl("/https/localhost.8000")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("API-KEY", apiKey)
                .build();
    }
    public Mono<ClinicalSessionSummaryDto> getClinicalSession(String sessionId) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/clinical/session/{sessionId}/summary/")
                        .build(sessionId))
                .retrieve()
                .onStatus(
                        status -> status.is4xxClientError(),
                        response -> response.bodyToMono(String.class)
                                .map(body ->
                                        new RuntimeException(
                                                "Django 4xx Error: " + body
                                        )
                                )
                )
                .bodyToMono(ClinicalSessionSummaryDto.class);
    }
}
