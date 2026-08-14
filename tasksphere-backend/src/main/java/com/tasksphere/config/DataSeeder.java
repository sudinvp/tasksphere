package com.tasksphere.config;

import com.tasksphere.model.Role;
import com.tasksphere.model.User;
import com.tasksphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a single default admin account on first boot so there's a way into
 * the system before any users self-register. Change this password immediately
 * in any real deployment.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .fullName("System Admin")
                    .email("admin@tasksphere.local")
                    .password(passwordEncoder.encode("ChangeMe123!"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }
    }
}
