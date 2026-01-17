package com.skill.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;
    private String recipient;
    @Column(length = 1000)
    private String content;
    private Long requestId; // Links chat to a specific request
    private LocalDateTime timestamp = LocalDateTime.now();

    public enum MessageType {
        CHAT, JOIN, LEAVE
    }

    @Enumerated(EnumType.STRING)
    private MessageType type;
}
