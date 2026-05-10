package com.nitkkr.marketplace.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "chats")
public class Chat {

    @Id
    private String id;

    private String productId;

    private String buyerId;
    private String sellerId;

    private String lastMessage;
    private Instant lastMessageAt;
}