package com.skill.controller;

import com.skill.model.Request;
import com.skill.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    @Autowired
    private RequestService requestService;

    @GetMapping
    public List<Request> getOpenRequests() {
        return requestService.getAllOpenRequests();
    }

    @PostMapping
    public ResponseEntity<Request> createRequest(@RequestBody Request request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        return ResponseEntity.ok(requestService.createRequest(request, email));
    }

    @PostMapping("/{id}/offer")
    public ResponseEntity<?> offerHelp(@PathVariable Long id, Authentication authentication) {
        try {
            Request request = requestService.offerHelp(id, authentication.getName());
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id, Authentication authentication) {
        try {
            requestService.deleteRequest(id, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptHelp(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(requestService.acceptHelp(id, authentication.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectHelp(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(requestService.rejectHelp(id, authentication.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeRequest(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(requestService.completeRequest(id, authentication.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<?> reopenRequest(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(requestService.reopenRequest(id, authentication.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public List<Request> getMyRequests(Authentication authentication) {
        return requestService.getMyRequests(authentication.getName());
    }

    @DeleteMapping("/my/all")
    public ResponseEntity<?> deleteAllMyRequests(Authentication authentication) {
        requestService.deleteAllMyRequests(authentication.getName());
        return ResponseEntity.ok().build();
    }
}
