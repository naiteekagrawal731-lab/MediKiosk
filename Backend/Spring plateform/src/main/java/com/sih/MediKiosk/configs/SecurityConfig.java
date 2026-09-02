package com.sih.MediKiosk.configs;


import com.sih.MediKiosk.filters.JwtFilter;
import com.sih.MediKiosk.security.user.AppUserDetailsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@Slf4j
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final AppUserDetailsService userDetailsService;

    public SecurityConfig(JwtFilter jwtFilter, AppUserDetailsService userDetailsService) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain updatingSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                // Allow H2 console frames
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .sessionManagement(sem -> sem.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                // Public endpoints
                                "/api/login/**",
                                "/api/auth/token",
                                "/api/register",
                                "/api/logout",

                                // H2 Console
                                "/h2-console/**",

                                // Static assets
                                "/",
                                "/ping",
                                "/public",
                                "/error",
                                "/favicon.ico",
                                "/index.html",
                                "/assets/**"
                        ).permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .userDetailsService(userDetailsService)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler()));

        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return ((request, response, authException) -> {
            String endPoint = request.getRequestURI();
            log.info("User not authenticated, denied from: {}", endPoint);
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Authentication required\"}");
        });
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return ((request, response, accessDeniedException) -> {
            String endPoint = request.getRequestURI();
            log.info("Access denied from: {}", endPoint);
            response.setStatus(403);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Access denied\"}");
        });
    }

    @Bean
    public PasswordEncoder getPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
