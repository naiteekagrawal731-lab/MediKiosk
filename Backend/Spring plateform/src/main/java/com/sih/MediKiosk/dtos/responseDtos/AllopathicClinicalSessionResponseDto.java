package com.sih.MediKiosk.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllopathicClinicalSessionResponseDto {

    // Patient details
    private String patientName;
    private Integer age;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String phoneNumber;

    // Clinical session details
    private String treatmentType;
    private String overallSummary;
    private String mainComplaint;

    private List<String> symptoms;
    private List<String> pastMedicalHistory;
    private List<String> pastSurgicalHistory;
    private List<String> medications;
    private List<String> allergies;
    private List<String> familyHistory;
    private List<String> lifestyleAndHabits;
    private List<String> additionalNotes;
    private List<String> redFlags;
}