package com.skill.config;

import com.skill.model.User;
import com.skill.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

        @Bean
        public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
                return args -> {
                        String demoEmail = "jackworking09@gmail.com";
                        if (userRepository.findByEmail(demoEmail).isEmpty()) {
                                User user = new User();
                                user.setName("Jack Demo");
                                user.setEmail(demoEmail);
                                user.setPassword(passwordEncoder.encode("password"));
                                // Set default location to London for demo
                                user.setLatitude(51.505);
                                user.setLongitude(-0.09);
                                userRepository.save(user);
                                System.out.println("Created Demo User: " + demoEmail);
                        }
                };
        }
}
