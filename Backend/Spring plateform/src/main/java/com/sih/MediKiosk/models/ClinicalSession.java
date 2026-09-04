package com.sih.MediKiosk.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class ClinicalSession {

    @Id
    private String id;

    @ManyToOne()
    @JoinColumn(name = "user_id", nullable = false)
    private User user;




}
