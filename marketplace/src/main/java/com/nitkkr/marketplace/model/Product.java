package com.nitkkr.marketplace.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String title;
    private String description;
    private double price;

    private List<String> images;

    private String category;
    private String location;
    private String condition;

    private String sellerId; // reference

    private boolean isActive;

    private Instant createdAt;
}