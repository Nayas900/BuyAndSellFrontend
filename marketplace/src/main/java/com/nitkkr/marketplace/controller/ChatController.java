package com.nitkkr.marketplace.controller;

import com.nitkkr.marketplace.model.Chat;
import com.nitkkr.marketplace.model.Message;
import com.nitkkr.marketplace.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatService service;

    public ChatController(ChatService service) {
        this.service = service;
    }

    // 🔥 START CHAT
    @PostMapping("/start")
    public Chat startChat(@RequestBody Map<String, String> body,
                          HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");
        String productId = body.get("productId");

        return service.startChat(productId, userId);
    }

    // 🔥 GET ALL CHATS
    @GetMapping
    public List<Map<String, Object>> getChats(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return service.getMyChats(userId);
    }

    // 🔥 GET MESSAGES
    @GetMapping("/{chatId}")
    public List<Map<String, Object>> getMessages(@PathVariable String chatId,
                                                 HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");
        return service.getMessages(chatId, userId);
    }

    // 🔥 SEND MESSAGE
    @PostMapping("/message")
    public Map<String, Object> sendMessage(@RequestBody Map<String, String> body,
                                           HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");

        return service.sendMessage(
                body.get("chatId"),
                userId,
                body.get("text")
        );
    }
}