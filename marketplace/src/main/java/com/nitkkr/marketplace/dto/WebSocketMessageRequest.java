package com.nitkkr.marketplace.dto;

import lombok.Data;

@Data
public class WebSocketMessageRequest {
    private String chatId;
    private String senderId;
    private String text;
}