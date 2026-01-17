package com.skill.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "requests")
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    private String item; // e.g., "Power Drill"
    private String type; // "Tools" or "Skills"
    private String description;
    private String duration; // e.g., "2 days", "1 hour"
    private String intent = "REQUEST"; // "REQUEST" (Need) or "OFFER" (Have)

    private String status = "OPEN"; // OPEN, PENDING_APPROVAL, ACCEPTED, COMPLETED

    @ManyToOne
    @JoinColumn(name = "helper_id")
    private User helper;

    private Double latitude;
    private Double longitude;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image;

    private LocalDateTime createdAt = LocalDateTime.now();
}
