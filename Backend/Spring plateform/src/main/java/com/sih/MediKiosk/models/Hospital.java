package com.sih.MediKiosk.models;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Audited;


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

    @PrePersist
    public void creatingHospital(){
        registrationNumber = UUID.randomUUID();
    }
}