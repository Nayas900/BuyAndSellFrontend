package com.nitkkr.marketplace.repository;

import com.nitkkr.marketplace.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {

    // Get all active products
    List<Product> findByIsActiveTrue();

    // Get products of a specific seller
    List<Product> findBySellerId(String sellerId);
    List<Product> findByIsActiveTrue(Pageable pageable);
    long countByIsActiveTrue();

    // Search products (title + description)
    @Query("{ 'isActive': true, $or: [ " +
            "{ 'title': { $regex: ?0, $options: 'i' } }, " +
            "{ 'description': { $regex: ?0, $options: 'i' } } ] }")
    List<Product> searchProducts(String search, Pageable pageable);

}