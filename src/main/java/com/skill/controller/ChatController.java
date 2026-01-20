package com.skill.controller;

import com.skill.model.ChatMessage;
import com.skill.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
// Note: @RestController includes @Controller, so @MessageMapping still works if
// the bean is scanned.
// However, standard practice often separates, but keeping together for
// simplicity now.
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private com.skill.service.EmailService emailService;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private org.springframework.messaging.simp.user.SimpUserRegistry userRegistry;

    private final java.util.concurrent.ScheduledExecutorService scheduler = java.util.concurrent.Executors
            .newScheduledThreadPool(1);

    // WebSocket handling
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        if (chatMessage.getTimestamp() == null) {
            chatMessage.setTimestamp(LocalDateTime.now());
        }
        chatMessageRepository.save(chatMessage);

        // Send to specific user directly using their email/username (recipient)
        messagingTemplate.convertAndSend("/topic/user/" + chatMessage.getRecipient().toLowerCase() + "/messages",
                chatMessage);

        // Also send to sender (for other open tabs)
        messagingTemplate.convertAndSend("/topic/user/" + chatMessage.getSender().toLowerCase() + "/messages",
                chatMessage);

        // Smart Email: Wait 40s, then check validity
        if (userRegistry.getUser(chatMessage.getRecipient()) == null) {
            scheduler.schedule(() -> {
                // Check again if user is still offline
                if (userRegistry.getUser(chatMessage.getRecipient()) == null) {
                    try {
                        emailService.sendSimpleMessage(
                                chatMessage.getRecipient(),
                                "New Message from " + chatMessage.getSender(),
                                "You have received a new message regarding your request on SkillSwap:\n\n" +
                                        chatMessage.getContent());
                    } catch (Exception e) {
                        System.err.println("Failed to send delayed email: " + e.getMessage());
                    }
                }
            }, 40, java.util.concurrent.TimeUnit.SECONDS);
        }
    }

    // REST API for sending messages (e.g. from Marketplace button)
    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendRestMessage(@RequestBody ChatMessage chatMessage,
            Authentication authentication) {
        // Enforce sender identity from token if possible
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        chatMessage.setSender(authentication.getName());

        if (chatMessage.getTimestamp() == null) {
            chatMessage.setTimestamp(LocalDateTime.now());
        }

        // Save
        ChatMessage saved = chatMessageRepository.save(chatMessage);

        // Forward to WebSocket users (real-time update)
        System.out.println("Sending WS to: " + saved.getRecipient());
        messagingTemplate.convertAndSend("/topic/user/" + saved.getRecipient().toLowerCase() + "/messages", saved);
        messagingTemplate.convertAndSend("/topic/user/" + saved.getSender().toLowerCase() + "/messages", saved);

        // Smart Email: Wait 40s, then check validity
        if (userRegistry.getUser(saved.getRecipient()) == null) {
            scheduler.schedule(() -> {
                // Check again if user is still offline
                if (userRegistry.getUser(saved.getRecipient()) == null) {
                    try {
                        emailService.sendSimpleMessage(
                                saved.getRecipient(),
                                "New Request/Message from " + saved.getSender(),
                                "You have received a new message/request on SkillSwap:\n\n" +
                                        saved.getContent());
                    } catch (Exception e) {
                        System.err.println("Failed to send delayed email: " + e.getMessage());
                    }
                }
            }, 40, java.util.concurrent.TimeUnit.SECONDS);
        }

        return ResponseEntity.ok(saved);
    }

    // Get Chat History
    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(Authentication authentication) {
        String currentUser = (authentication != null) ? authentication.getName() : "jackworking09@gmail.com";
        return ResponseEntity
                .ok(chatMessageRepository.findBySenderOrRecipientOrderByTimestampAsc(currentUser, currentUser));
    }

    @Autowired
    private com.skill.repository.UserRepository userRepository;

    // Get Active Conversations (People the user has chatted with)
    @GetMapping("/conversations")
    public ResponseEntity<List<java.util.Map<String, String>>> getConversations(Authentication authentication) {
        String currentUser = (authentication != null) ? authentication.getName() : "jackworking09@gmail.com";

        // Fetch specific user's messages ordered by latest first
        List<ChatMessage> messages = chatMessageRepository.findBySenderOrRecipientOrderByTimestampDesc(currentUser,
                currentUser);

        // Use LinkedHashSet to maintain insertion order (Recent first) and ensure
        // uniqueness
        java.util.Set<String> partnersEnv = new java.util.LinkedHashSet<>();

        for (ChatMessage msg : messages) {
            if (msg.getSender().equals(currentUser)) {
                partnersEnv.add(msg.getRecipient());
            } else {
                partnersEnv.add(msg.getSender());
            }
        }

        List<java.util.Map<String, String>> result = new java.util.ArrayList<>();
        for (String email : partnersEnv) {
            String name = "User";
            com.skill.model.User u = userRepository.findByEmail(email).orElse(null);

            java.util.Map<String, String> map = new java.util.HashMap<>();
            map.put("email", email);

            if (u != null) {
                name = u.getName();
                if (u.getProfilePhoto() != null && u.getProfilePhoto().length > 0) {
                    map.put("photo", java.util.Base64.getEncoder().encodeToString(u.getProfilePhoto()));
                }
            }
            map.put("name", name);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }
}
