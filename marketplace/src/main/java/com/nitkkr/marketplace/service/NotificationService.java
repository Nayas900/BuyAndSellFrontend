package com.nitkkr.marketplace.service;

import com.nitkkr.marketplace.model.Notification;
import com.nitkkr.marketplace.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import jakarta.annotation.PostConstruct;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    @Autowired
    private MongoTemplate mongoTemplate;

    @PostConstruct
    public void printDbName() {
        System.out.println("🔥 Connected DB: " + mongoTemplate.getDb().getName());
    }

    public void createNotification(String userId, String type, String title, String body, String productId) {
        System.out.println("🔥 Notification created for user: " + userId);
        Notification n = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .body(body)
                .productId(productId)
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        repo.save(n);
    }

    public List<Notification> getNotifications(String userId) {
        List<Notification> list = repo.findByUserIdOrderByCreatedAtDesc(userId);

        // 🔥 DEBUG PRINT
        System.out.println("==== ALL NOTIFICATIONS IN DB FOR USER ====");
        for (Notification n : list) {
            System.out.println(n);
        }
        System.out.println("Total found: " + list.size());

        return list;
    }

    public long getUnreadCount(String userId) {
        return repo.countByUserIdAndIsReadFalse(userId);
    }

    public void markAllRead(String userId) {
        List<Notification> list = repo.findByUserIdOrderByCreatedAtDesc(userId);

        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
            }
        }

        repo.saveAll(list);
    }
}