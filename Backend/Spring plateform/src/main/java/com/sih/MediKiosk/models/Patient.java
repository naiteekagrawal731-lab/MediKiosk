package com.sih.MediKiosk.models;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Audited;
import org.springframework.data.annotation.Id;

import java.util.UUID;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Audited.Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String gender;

    private LocalDate dateOfBirth;

    private String bloodGroup;

    private String phoneNumber;
}