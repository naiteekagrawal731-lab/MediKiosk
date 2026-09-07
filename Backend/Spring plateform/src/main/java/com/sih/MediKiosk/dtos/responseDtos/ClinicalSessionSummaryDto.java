package com.sih.MediKiosk.dtos.responseDtos;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClinicalSessionSummaryDto {

    // Patient details
    private String patientName;
    private String gender;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String phoneNumber;

    // Clinical session details
    private String treatmentType;
    private String overallSummary;
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
    private String aharaShakti;
    private String vyayamaShakti;
    private String vaya;
    private String agni;
    private String koshtha;

    private List<String> aharaVihara;
    private List<String> nidana;
    private List<String> samprapti;

    private List<String> pastMedicalHistory;
    private List<String> pastSurgicalHistory;
    private List<String> medications;
    private List<String> allergies;
    private List<String> familyHistory;
    private List<String> lifestyleAndHabits;
    private List<String> redFlags;
    private List<String> additionalNotes;
}