package com.sih.MediKiosk.models;
import jakarta.persistence.*;
import lombok.*;


import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "patient",cascade = CascadeType.ALL)
    private List<ClinicalSession> clinicalSessions;

    private String gender;

    private LocalDate dateOfBirth;

    private String bloodGroup;

    private String phoneNumber;
}