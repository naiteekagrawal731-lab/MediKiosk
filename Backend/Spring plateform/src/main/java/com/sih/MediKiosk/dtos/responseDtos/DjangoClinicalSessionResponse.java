package com.sih.MediKiosk.dtos.responseDtos;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DjangoClinicalSessionResponse {

    private String session;

    @JsonProperty("summary_data")
    @JsonAlias({"summary_data", "summaryData"})
    private ClinicalSessionSummaryDto summaryData;

    @JsonProperty("ai_generated")
    @JsonAlias({"ai_generated", "aiGenerated"})
    private boolean aiGenerated;

    @JsonProperty("doctor_verified")
    @JsonAlias({"doctor_verified", "doctorVerified"})
    private boolean doctorVerified;

    @JsonProperty("doctor_edited")
    @JsonAlias({"doctor_edited", "doctorEdited"})
    private boolean doctorEdited;

    @JsonProperty("verified_at")
    @JsonAlias({"verified_at", "verifiedAt"})
    private String verifiedAt;

    @JsonProperty("created_at")
    @JsonAlias({"created_at", "createdAt"})
    private String createdAt;

    @JsonProperty("updated_at")
    @JsonAlias({"updated_at", "updatedAt"})
    private String updatedAt;
}