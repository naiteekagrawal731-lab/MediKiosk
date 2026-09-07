package com.sih.MediKiosk.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AyushClinicalSessionResponseDto {

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
    private List<String> additionalNotes;
}