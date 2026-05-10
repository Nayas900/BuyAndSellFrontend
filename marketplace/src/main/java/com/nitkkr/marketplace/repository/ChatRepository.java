package com.nitkkr.marketplace.repository;

import com.nitkkr.marketplace.model.Chat;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends MongoRepository<Chat, String> {

    Optional<Chat> findByProductIdAndBuyerId(String productId, String buyerId);

    List<Chat> findByBuyerIdOrSellerIdOrderByLastMessageAtDesc(String buyerId, String sellerId);
}