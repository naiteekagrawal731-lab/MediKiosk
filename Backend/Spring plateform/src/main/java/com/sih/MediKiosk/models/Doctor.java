package com.sih.MediKiosk.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.*;
import org.hibernate.annotations.Audited;

import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Audited.Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(unique = true)
    private String licenseNumber;

    private String specialization;

    private String qualification;
}