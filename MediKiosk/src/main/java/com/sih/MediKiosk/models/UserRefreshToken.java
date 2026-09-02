package com.sih.MediKiosk.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "user_refresh_tokens")
public class UserRefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true)
    private UUID token;

    private Instant createdAt;

    private Instant expiryAt;

    @OneToOne
    private User user;

    @PrePersist
    public void setCreatedAt(){
        createdAt = Instant.now();
        if(expiryAt != null)return;
        Long expiryTimiMili = 1000*60*60*24*30l;// 30 days
        expiryAt = Instant.now().plusMillis(expiryTimiMili);
    }

}