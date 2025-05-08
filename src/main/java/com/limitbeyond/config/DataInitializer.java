package com.limitbeyond.config;

import com.limitbeyond.model.Role;
import com.limitbeyond.model.User;
import com.limitbeyond.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin user if no users exist
        if (userRepository.count() == 0) {
            System.out.println("No users found, creating admin user");

            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setEmail("admin@limitbeyond.com");
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            adminUser.setPhoneNumber("1234567890");
            adminUser.setActive(true);

            Set<Role> roles = new HashSet<>();
            roles.add(Role.ADMIN);
            adminUser.setRoles(roles);

            userRepository.save(adminUser);

            System.out.println("Admin user created successfully");
        }
    }
}