package com.sih.MediKiosk.services;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.MediKiosk.dtos.responseDtos.DjangoClinicalSessionResponse;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j 
public class DjangoClient {
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public DjangoClient(WebClient.Builder builder,
                      @Value("${django.api.key}") String apiKey) {

        this.webClient = builder
                .baseUrl("https://medikiosk-7f7g.onrender.com")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("API-KEY", apiKey)
                .build();

        this.objectMapper = new ObjectMapper();
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        this.objectMapper.findAndRegisterModules();
    }

    public Mono<DjangoClinicalSessionResponse> getClinicalSession(String sessionId) {

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
            .bodyToMono(String.class)
            .doOnNext(response ->
                    log.info("========== DJANGO RAW RESPONSE ==========\n{}", response)
            )
            .map(response -> {
                try {
                    return objectMapper.readValue(
                            response,
                            DjangoClinicalSessionResponse.class
                    );
                } catch (Exception e) {
                    log.error("Failed to convert Django response to DTO. Raw response: {}", response, e);
                    throw new RuntimeException(
                            "Failed to convert Django response to DTO: " + e.getMessage(), e
                    );
                }
            });
    }
}
