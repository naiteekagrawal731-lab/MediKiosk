package com.sih.MediKiosk.models;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Audited;


import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Audited.Table(name = "hospitals")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String address;

    private String city;

    private String state;

    private String phoneNumber;

    @Column(unique = true)
    private UUID registrationNumber;

    private LocalDate dateOfBirth;

    private String bloodGroup;

    @ManyToMany
    @JoinTable(
            name = "hospital_patients",
            joinColumns = @JoinColumn(name = "hospital_id"),
            inverseJoinColumns = @JoinColumn(name = "patient_id")
    )
    private List<Patient> patients;

    @ManyToMany
    @JoinTable(
            name = "hospital_guests",
            joinColumns = @JoinColumn(name = "hospital_id"),
            inverseJoinColumns = @JoinColumn(name = "guest_id")
    )
    private List<Guest> guests;


    @PrePersist
    public void creatingHospital(){
        registrationNumber = UUID.randomUUID();
    }
}