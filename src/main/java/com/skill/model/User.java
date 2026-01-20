package com.skill.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String role = "USER";

    private int karma = 100; // Default Starting Karma

    private Double latitude;
    private Double longitude;

    @Column(length = 1000)
    private String about;

    private String title; // e.g. "Full Stack Developer"

    @Column(length = 2000)
    private String skills; // JSON string or comma-separated list

    @Lob
    @Column(length = 1000000)
    private byte[] profilePhoto;
}
