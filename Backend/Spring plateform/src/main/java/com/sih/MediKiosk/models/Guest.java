package com.sih.MediKiosk.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private String gender;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String phoneNumber;


    @OneToOne(mappedBy = "guest")
    private ClinicalSession clinicalSession;
}
