package com.skill.controller;

import com.skill.model.User;
import com.skill.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // REGISTER USER
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        String response = userService.saveUser(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<String> getCurrentUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authentication.getName());
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.getUserByEmail(authentication.getName());
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateUserProfile(@RequestBody User user,
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User updatedUser = userService.updateUserProfile(authentication.getName(), user);
        updatedUser.setPassword(null);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/photo")
    public ResponseEntity<String> uploadProfilePhoto(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        try {
            userService.updateProfilePhoto(authentication.getName(), file.getBytes());
            return ResponseEntity.ok("Profile photo updated");
        } catch (java.io.IOException e) {
            return ResponseEntity.status(500).body("Error uploading file");
        }
    }
}
