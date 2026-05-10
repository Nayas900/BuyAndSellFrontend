package com.nitkkr.marketplace.controller;

import com.nitkkr.marketplace.service.NotificationService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> getNotifications(HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");

        return Map.of(
                "notifications", service.getNotifications(userId),
                "unreadCount", service.getUnreadCount(userId)
        );
    }

    @PatchMapping("/read-all")
    public String markAllRead(HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");

        service.markAllRead(userId);

        return "All notifications marked as read";
    }
}