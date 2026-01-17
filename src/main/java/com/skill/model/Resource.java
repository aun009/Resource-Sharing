package com.skill.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "resources")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String category; // Tool or Skill

    @Column(nullable = false)
    private String price; // e.g. "5 Karma/day"

    @Lob
    @Column(name = "image", columnDefinition = "LONGBLOB")
    private byte[] image;

    private String status = "Available"; // Available, Lent, etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Helper to return user name in JSON if needed, or DTO could be used
    public String getOwnerName() {
        return user != null ? user.getName() : "Unknown";
    }

    public String getOwnerEmail() {
        return user != null ? user.getEmail() : null;
    }
}
