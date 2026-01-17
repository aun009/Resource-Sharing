package com.skill.service;

import com.skill.model.Request;
import com.skill.model.User;
import com.skill.repository.RequestRepository;
import com.skill.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequestService {

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private EmailService emailService;

    public List<Request> getAllOpenRequests() {
        return requestRepository.findByStatus("OPEN");
    }

    public Request createRequest(Request request, String email) {
        User requester = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        request.setRequester(requester);
        Request savedRequest = requestRepository.save(request);

        // Geolocation Notification Logic
        // Notify All Users (Geolocation Logic Replaced)
        List<User> allUsers = userRepository.findAll();

        for (User user : allUsers) {
            if (!user.getEmail().equals(email)) {
                // Send Email
                String subject = "New Request: " + request.getItem();
                String text = "Hi " + user.getName() + ",\n\n" +
                        requester.getName() + " is looking for " + request.getItem()
                        + ".\n" +
                        "Log in to SkillSwap to offer help!";

                emailService.sendSimpleMessage(user.getEmail(), subject, text);

                // Send WebSocket Notification
                messagingTemplate.convertAndSendToUser(
                        user.getEmail(),
                        "/queue/notifications",
                        "New Request: " + requester.getName() + " needs " + request.getItem());
            }
        }

        return savedRequest;
    }

    public Request offerHelp(Long requestId, String email) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        User helper = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getRequester().getEmail().equals(email)) {
            throw new RuntimeException("You cannot offer help to your own request.");
        }

        if (request.getStatus().equals("OPEN")) {
            request.setStatus("PENDING_APPROVAL");
            request.setHelper(helper);
            Request updatedRequest = requestRepository.save(request);

            // Notify the requester via WebSocket
            messagingTemplate.convertAndSendToUser(
                    request.getRequester().getEmail(),
                    "/queue/notifications",
                    "User " + helper.getName() + " has offered to help with your request: " + request.getItem());

            return updatedRequest;
        } else {
            throw new RuntimeException("Request is not open");
        }
    }

    public void deleteRequest(Long requestId, String email) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getRequester().getEmail().equals(email)) {
            throw new RuntimeException("You are not authorized to delete this request.");
        }

        requestRepository.delete(request);
    }

    public Request acceptHelp(Long requestId, String email) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getRequester().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        if ("PENDING_APPROVAL".equals(request.getStatus())) {
            request.setStatus("IN_PROGRESS");
            Request saved = requestRepository.save(request);

            if (request.getHelper() != null) {
                messagingTemplate.convertAndSendToUser(
                        request.getHelper().getEmail(),
                        "/queue/notifications",
                        "Your offer to help " + request.getRequester().getName() + " was ACCEPTED!");
            }
            return saved;
        }
        throw new RuntimeException("Invalid status for acceptance");
    }

    public Request rejectHelp(Long requestId, String email) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getRequester().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        if ("PENDING_APPROVAL".equals(request.getStatus())) {
            User previousHelper = request.getHelper();
            request.setStatus("OPEN");
            request.setHelper(null);
            Request saved = requestRepository.save(request);

            if (previousHelper != null) {
                messagingTemplate.convertAndSendToUser(
                        previousHelper.getEmail(),
                        "/queue/notifications",
                        "Your offer to help " + request.getRequester().getName() + " was declined.");
            }
            return saved;
        }
        throw new RuntimeException("Invalid status for rejection");
    }

    public Request completeRequest(Long requestId, String email) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getRequester().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        if ("IN_PROGRESS".equals(request.getStatus())) {
            request.setStatus("COMPLETED");
            Request saved = requestRepository.save(request);

            // Award Karma Points to Helper
            if (request.getHelper() != null) {
                User helper = request.getHelper();
                // Add 10 Karma points
                helper.setKarma(helper.getKarma() + 10);
                userRepository.save(helper);

                messagingTemplate.convertAndSendToUser(
                        helper.getEmail(),
                        "/queue/notifications",
                        "Request " + request.getItem() + " marked as COMPLETED! You earned 10 Karma points!");
            }
            return saved;
        }
        throw new RuntimeException("Invalid status for completion");
    }

    public Request reopenRequest(Long requestId, String email) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getRequester().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        if ("IN_PROGRESS".equals(request.getStatus())) {
            User previousHelper = request.getHelper();
            request.setStatus("OPEN");
            request.setHelper(null);
            Request saved = requestRepository.save(request);

            if (previousHelper != null) {
                messagingTemplate.convertAndSendToUser(
                        previousHelper.getEmail(),
                        "/queue/notifications",
                        "The request " + request.getItem() + " was reopened by the owner (incomplete).");
            }
            return saved;
        }
        throw new RuntimeException("Invalid status for reopen");
    }

    public List<Request> getMyRequests(String email) {
        return requestRepository.findByRequesterEmailOrHelperEmail(email, email);
    }

    public void deleteAllMyRequests(String email) {
        List<Request> requests = requestRepository.findByRequesterEmailOrHelperEmail(email, email);
        for (Request request : requests) {
            if (request.getRequester().getEmail().equals(email)) {
                requestRepository.delete(request);
            }
        }
    }
}
