package com.nitkkr.marketplace.repository;

import com.nitkkr.marketplace.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findByChatIdOrderByCreatedAtAsc(String chatId);

    long countByChatIdAndSenderIdNotAndIsReadFalse(String chatId, String userId);


}