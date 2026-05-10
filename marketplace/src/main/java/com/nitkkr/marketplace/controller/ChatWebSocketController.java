package com.nitkkr.marketplace.controller;

import com.nitkkr.marketplace.dto.WebSocketMessageRequest;
import com.nitkkr.marketplace.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(ChatService chatService,
                                   SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(WebSocketMessageRequest req) {

        Map<String, Object> message = chatService.sendMessage(
                req.getChatId(),
                req.getSenderId(),
                req.getText()
        );

        messagingTemplate.convertAndSend(
                "/topic/chat/" + req.getChatId(),
                message
        );
    }
}