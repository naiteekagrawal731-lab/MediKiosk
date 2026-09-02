package com.sih.MediKiosk.security.user;


import com.sih.MediKiosk.exceptions.UsernameNotFound;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepo userRepository;

    public AppUserDetailsService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.getUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFound("User with username = " + username + " does not exist"));
        return new AppUserDetails(user);
    }
}
