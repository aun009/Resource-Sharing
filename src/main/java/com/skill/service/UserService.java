package com.skill.service;

import com.skill.model.User;
import com.skill.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public String saveUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User added to system";
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUserProfile(String email, User updatedData) {
        User existingUser = getUserByEmail(email);

        if (updatedData.getName() != null && !updatedData.getName().isEmpty()) {
            existingUser.setName(updatedData.getName());
        }
        if (updatedData.getTitle() != null) {
            existingUser.setTitle(updatedData.getTitle());
        }
        if (updatedData.getAbout() != null) {
            existingUser.setAbout(updatedData.getAbout());
        }
        if (updatedData.getSkills() != null) {
            existingUser.setSkills(updatedData.getSkills());
        }

        return userRepository.save(existingUser);
    }

    public void updateProfilePhoto(String email, byte[] photo) {
        User user = getUserByEmail(email);
        user.setProfilePhoto(photo);
        userRepository.save(user);
    }
}
