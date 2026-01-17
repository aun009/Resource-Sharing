package com.skill.service;

import com.skill.model.Resource;
import com.skill.model.User;
import com.skill.repository.ResourceRepository;
import com.skill.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    public List<Resource> getAllAvailableResources() {
        return resourceRepository.findAll();
    }

    public Resource addResource(Resource resource, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        resource.setUser(user);
        Resource savedResource = resourceRepository.save(resource);

        // Notify Nearby Users Logic (Same as RequestService)
        // Notify All Users
        List<User> allUsers = userRepository.findAll();

        for (User neighbor : allUsers) {
            if (!neighbor.getEmail().equals(userEmail)) {
                // Send Email
                String subject = "New Resource Available: " + resource.getTitle();
                String text = "Hi " + neighbor.getName() + ",\n\n" +
                        user.getName() + " just listed a new " + resource.getCategory() + ": " + resource.getTitle()
                        +
                        "\nCheck it out on SkillSwap!";

                emailService.sendSimpleMessage(neighbor.getEmail(), subject, text);

                // Send WebSocket Notification
                messagingTemplate.convertAndSendToUser(
                        neighbor.getEmail(),
                        "/queue/notifications",
                        "New " + resource.getCategory() + " available: " + resource.getTitle());
            }
        }

        return savedResource;
    }

    public List<Resource> getUserResources(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return resourceRepository.findByUserId(user.getId());
    }
}
