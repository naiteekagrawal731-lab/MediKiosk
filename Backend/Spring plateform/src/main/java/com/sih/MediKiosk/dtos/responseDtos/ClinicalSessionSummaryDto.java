package com.sih.MediKiosk.dtos.responseDtos;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ClinicalSessionSummaryDto {

    private String session;

    // Patient details
    @JsonProperty("patient_name")
    @JsonAlias({"patient_name", "patientName"})
    private String patientName;

    private String gender;

    @JsonProperty("date_of_birth")
    @JsonAlias({"date_of_birth", "dateOfBirth"})
    private LocalDate dateOfBirth;

    @JsonProperty("blood_group")
    @JsonAlias({"blood_group", "bloodGroup"})
    private String bloodGroup;

    @JsonProperty("phone_number")
    @JsonAlias({"phone_number", "phoneNumber"})
    private String phoneNumber;

    // Clinical session details
    @JsonProperty("treatment_type")
    @JsonAlias({"treatment_type", "treatmentType"})
    private String treatmentType;

    @JsonProperty("overall_summary")
    @JsonAlias({"overall_summary", "overallSummary"})
    private String overallSummary;

    @JsonProperty("main_complaint")
    @JsonAlias({"main_complaint", "mainComplaint"})
    private String mainComplaint;

    private List<String> symptoms;

    // AYUSH assessment
    private String prakriti;

    private String vikriti;

    private String sara;

    private String samhanana;

    private String pramana;

    private String satmya;

    private String sattva;

    @JsonProperty("ahara_shakti")
    @JsonAlias({"ahara_shakti", "aharaShakti"})
    private String aharaShakti;

    @JsonProperty("vyayama_shakti")
    @JsonAlias({"vyayama_shakti", "vyayamaShakti"})
    private String vyayamaShakti;

    private String vaya;

    private String agni;

    private String koshtha;

    @JsonProperty("ahara_vihara")
    @JsonAlias({"ahara_vihara", "aharaVihara"})
    private List<String> aharaVihara;

    private List<String> nidana;

    private List<String> samprapti;

    // ALLOPATHIC assessment
    @JsonProperty("past_medical_history")
    @JsonAlias({"past_medical_history", "pastMedicalHistory"})
    private List<String> pastMedicalHistory;

    @JsonProperty("past_surgical_history")
    @JsonAlias({"past_surgical_history", "pastSurgicalHistory"})
    private List<String> pastSurgicalHistory;

    private List<String> medications;

    private List<String> allergies;

    @JsonProperty("family_history")
    @JsonAlias({"family_history", "familyHistory"})
    private List<String> familyHistory;

    @JsonProperty("lifestyle_and_habits")
    @JsonAlias({"lifestyle_and_habits", "lifestyleAndHabits"})
    private List<String> lifestyleAndHabits;

    @JsonProperty("red_flags")
    @JsonAlias({"red_flags", "redFlags"})
    private List<String> redFlags;

    @JsonProperty("additional_notes")
    @JsonAlias({"additional_notes", "additionalNotes"})
    private List<String> additionalNotes;
}