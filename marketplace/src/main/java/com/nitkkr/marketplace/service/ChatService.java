package com.nitkkr.marketplace.service;

import com.nitkkr.marketplace.model.Chat;
import com.nitkkr.marketplace.model.Message;
import com.nitkkr.marketplace.model.Product;
import com.nitkkr.marketplace.model.User;
import com.nitkkr.marketplace.repository.ChatRepository;
import com.nitkkr.marketplace.repository.MessageRepository;
import com.nitkkr.marketplace.repository.ProductRepository;
import com.nitkkr.marketplace.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    private final ChatRepository chatRepo;
    private final MessageRepository messageRepo;
    private final ProductRepository productRepo;
    private final NotificationService notificationService;
    private final UserRepository userRepo;

    public ChatService(ChatRepository chatRepo,
                       MessageRepository messageRepo,
                       ProductRepository productRepo,
                       NotificationService notificationService,
                       UserRepository userRepo) {
        this.chatRepo = chatRepo;
        this.messageRepo = messageRepo;
        this.productRepo = productRepo;
        this.notificationService = notificationService;
        this.userRepo = userRepo;
    }

    public Chat startChat(String productId, String userId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getSellerId().equals(userId)) {
            throw new RuntimeException("You cannot chat with yourself");
        }

        return chatRepo.findByProductIdAndBuyerId(productId, userId)
                .orElseGet(() -> {
                    Chat chat = Chat.builder()
                            .productId(productId)
                            .buyerId(userId)
                            .sellerId(product.getSellerId())
                            .lastMessage("")
                            .lastMessageAt(Instant.now())
                            .build();

                    return chatRepo.save(chat);
                });
    }

    public List<Map<String, Object>> getMyChats(String userId) {
        List<Chat> chats =
                chatRepo.findByBuyerIdOrSellerIdOrderByLastMessageAtDesc(userId, userId);

        return chats.stream().map(chat -> {
            long unread = messageRepo.countByChatIdAndSenderIdNotAndIsReadFalse(
                    chat.getId(),
                    userId
            );

            Product product = productRepo.findById(chat.getProductId()).orElse(null);
            User buyer = userRepo.findById(chat.getBuyerId()).orElse(null);
            User seller = userRepo.findById(chat.getSellerId()).orElse(null);

            Map<String, Object> map = new HashMap<>();

            map.put("_id", chat.getId());
            map.put("lastMessage", chat.getLastMessage());
            map.put("lastMessageAt", chat.getLastMessageAt());
            map.put("unreadCount", unread);

            map.put("buyerId", userMap(chat.getBuyerId(), buyer));
            map.put("sellerId", userMap(chat.getSellerId(), seller));

            if (product != null) {
                map.put("productId", Map.of(
                        "_id", product.getId(),
                        "title", product.getTitle(),
                        "price", product.getPrice(),
                        "images", product.getImages() != null ? product.getImages() : List.of()
                ));
            } else {
                map.put("productId", Map.of(
                        "_id", chat.getProductId(),
                        "title", "Unknown",
                        "price", 0,
                        "images", List.of()
                ));
            }

            return map;
        }).toList();
    }

    public List<Map<String, Object>> getMessages(String chatId, String userId) {
        List<Message> messages = messageRepo.findByChatIdOrderByCreatedAtAsc(chatId);

        return messages.stream().map(m -> {
            if (!m.getSenderId().equals(userId) && !m.isRead()) {
                m.setRead(true);
                messageRepo.save(m);
            }

            User senderUser = userRepo.findById(m.getSenderId()).orElse(null);

            Map<String, Object> map = new HashMap<>();

            map.put("_id", m.getId());
            map.put("chatId", m.getChatId());
            map.put("text", m.getText());
            map.put("isRead", m.isRead());
            map.put("createdAt", m.getCreatedAt());
            map.put("senderId", userMap(m.getSenderId(), senderUser));

            return map;
        }).toList();
    }

    public Map<String, Object> sendMessage(String chatId, String userId, String text) {
        Chat chat = chatRepo.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        boolean isParticipant =
                chat.getBuyerId().equals(userId) ||
                        chat.getSellerId().equals(userId);

        if (!isParticipant) {
            throw new RuntimeException("Access denied");
        }

        Message message = Message.builder()
                .chatId(chatId)
                .senderId(userId)
                .text(text)
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        message = messageRepo.save(message);

        String receiverId = chat.getBuyerId().equals(userId)
                ? chat.getSellerId()
                : chat.getBuyerId();

        notificationService.createNotification(
                receiverId,
                "new_message",
                "New message received",
                text,
                chatId
        );

        chat.setLastMessage(text);
        chat.setLastMessageAt(Instant.now());
        chatRepo.save(chat);

        User senderUser = userRepo.findById(message.getSenderId()).orElse(null);

        Map<String, Object> response = new HashMap<>();

        response.put("_id", message.getId());
        response.put("chatId", message.getChatId());
        response.put("text", message.getText());
        response.put("isRead", message.isRead());
        response.put("createdAt", message.getCreatedAt());
        response.put("senderId", userMap(message.getSenderId(), senderUser));

        return response;
    }

    private Map<String, Object> userMap(String id, User user) {
        return Map.of(
                "_id", id,
                "name", user != null && user.getName() != null ? user.getName() : "Unknown User",
                "avatar", user != null && user.getAvatar() != null ? user.getAvatar() : ""
        );
    }
}
