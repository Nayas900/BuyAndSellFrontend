package com.nitkkr.marketplace.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;

    private String type; // product_posted, deal_closed, etc.

    private String title;
    private String body;

    private String productId;

    private boolean isRead;

    private Instant createdAt;
}