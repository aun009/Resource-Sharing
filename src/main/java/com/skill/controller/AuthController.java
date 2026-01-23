package com.skill.controller;

import com.skill.dto.AuthRequest;
import com.skill.model.User;
import com.skill.security.JwtUtils;
import com.skill.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public org.springframework.http.ResponseEntity<?> addNewUser(@RequestBody User user) {
        try {
            String result = userService.saveUser(user);
            return org.springframework.http.ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<?> authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));
            if (authentication.isAuthenticated()) {
                return org.springframework.http.ResponseEntity.ok(jwtService.generateToken(authRequest.getEmail()));
            } else {
                throw new UsernameNotFoundException("Invalid user request");
            }
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}
