package com.sih.MediKiosk.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "clinical_sessions")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClinicalSession {

    @Id
    private String id;

    private String tempData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToOne()
    @JoinColumn(name = "guest_id")
    private Guest guest;

    private LocalDateTime createdAt;

    private String summary;

    private boolean hasGottenSummary;
    @PrePersist
    public void create(){
        createdAt = LocalDateTime.now();
        hasGottenSummary = false;
    }
}