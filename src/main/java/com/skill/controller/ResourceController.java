package com.skill.controller;

import org.springframework.web.multipart.MultipartFile;
import com.skill.model.Resource;
import com.skill.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllAvailableResources());
    }

    @PostMapping
    public ResponseEntity<Resource> addResource(
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("price") String price,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()
                    || "anonymousUser".equals(authentication.getName())) {
                return ResponseEntity.status(401).build();
            }
            String currentPrincipalName = authentication.getName();

            Resource resource = new Resource();
            resource.setTitle(title);
            resource.setCategory(category);
            resource.setPrice(price);
            resource.setDescription(description);

            if (imageFile != null && !imageFile.isEmpty()) {
                resource.setImage(imageFile.getBytes());
                System.out.println("Uploaded image size: " + imageFile.getSize());
            }

            return ResponseEntity.ok(resourceService.addResource(resource, currentPrincipalName));
        } catch (Exception e) {
            System.err.println("Error in addResource: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<Resource>> getMyResources() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        return ResponseEntity.ok(resourceService.getUserResources(currentPrincipalName));
    }
}
