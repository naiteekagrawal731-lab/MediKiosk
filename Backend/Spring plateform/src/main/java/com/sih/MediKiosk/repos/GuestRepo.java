package com.sih.MediKiosk.repos;

import com.sih.MediKiosk.models.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
@Repository
public interface GuestRepo extends JpaRepository<Guest, UUID> {
}
