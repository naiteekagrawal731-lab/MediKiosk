package com.sih.MediKiosk.repos;


import com.sih.MediKiosk.models.Role;
import com.sih.MediKiosk.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<User, UUID> {

    Optional<User> getUserByUsername(String username);

    Page<User> findByUsernameContainingIgnoreCaseAndRole(
            String username,
            Role role,
            Pageable pageable
    );

}
