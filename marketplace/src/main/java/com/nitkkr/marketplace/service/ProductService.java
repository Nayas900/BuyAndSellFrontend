package com.nitkkr.marketplace.service;

import com.nitkkr.marketplace.model.Product;
import com.nitkkr.marketplace.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    public ProductService(ProductRepository productRepository,
                          NotificationService notificationService) {
        this.productRepository = productRepository;
        this.notificationService = notificationService;
    }

    public Product createProduct(Product product, String userId) {
        product.setSellerId(userId);
        product.setCreatedAt(Instant.now());
        product.setActive(true);
        Product saved = productRepository.save(product);

        notificationService.createNotification(
                userId,
                "product_posted",
                "Your listing is live!",
                saved.getTitle(),
                saved.getId()
        );

        return saved;
    }

    public List<Product> getAllProducts() {
        return productRepository.findByIsActiveTrue();
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> getMyProducts(String userId) {
        return productRepository.findBySellerId(userId);
    }

    public void closeProduct(String id, String userId) {
        Product product = getProductById(id);

        if (!product.getSellerId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }
        product.setActive(false);
        productRepository.save(product);

        notificationService.createNotification(
                userId,
                "deal_closed",
                "Deal closed",
                product.getTitle(),
                product.getId()
        );
    }

    public void deleteProduct(String id, String userId) {
        Product product = getProductById(id);

        if (!product.getSellerId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        productRepository.deleteById(id);
    }

    public Map<String, Object> getProducts(String search, String category, int page) {

        int limit = 10;
        Pageable pageable = PageRequest.of(page - 1, limit);

        List<Product> products;
        long total;

        if (search != null && !search.isEmpty()) {
            products = productRepository.searchProducts(search, pageable);
            total = products.size();
        } else {
            products = productRepository.findByIsActiveTrue(pageable);
            total = productRepository.countByIsActiveTrue();
        }

        if (category != null && !category.isEmpty()) {
            products = products.stream()
                    .filter(p -> p.getCategory().equalsIgnoreCase(category))
                    .toList();
            total = products.size();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("total", total);

        return response;
    }
}