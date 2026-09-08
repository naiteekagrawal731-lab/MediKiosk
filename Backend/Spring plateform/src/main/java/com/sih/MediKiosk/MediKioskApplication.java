package com.sih.MediKiosk;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.sih.MediKiosk.models.Hospital;
import com.sih.MediKiosk.models.Role;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.HospitalRepo;
import com.sih.MediKiosk.repos.UserRepo;

@SpringBootApplication

public class MediKioskApplication {

	public static void main(String[] args) {
		SpringApplication.run(MediKioskApplication.class, args);
	}
	private final UserRepo userRepo;
	private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	MediKioskApplication(UserRepo userRepo){
		this.userRepo = userRepo;
	}
	@Bean
    CommandLineRunner run() {
        return args -> {
            
        };
    }
	

}
