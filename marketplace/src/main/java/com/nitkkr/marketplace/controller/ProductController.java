package com.nitkkr.marketplace.controller;

import com.nitkkr.marketplace.model.Product;
import com.nitkkr.marketplace.model.User;
import com.nitkkr.marketplace.repository.UserRepository;
import com.nitkkr.marketplace.service.ProductService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    public ProductController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product,
                                 HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");

        return productService.createProduct(product, userId);
    }

    @GetMapping
    public Map<String, Object> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page
    ) {
        Map<String, Object> serviceResponse =
                productService.getProducts(search, category, page);

        List<Product> products = (List<Product>) serviceResponse.get("products");
        long total = (long) serviceResponse.get("total");

        List<Map<String, Object>> result = new ArrayList<>();

        for (Product p : products) {
            User user = null;

            if (p.getSellerId() == null) {
                System.out.println("❌ NULL sellerId product: " + p.getId());
            } else {
                user = userRepository.findById(p.getSellerId()).orElse(null);
            }

            Map<String, Object> map = new HashMap<>();
            map.put("_id", p.getId());
            map.put("title", p.getTitle());
            map.put("description", p.getDescription());
            map.put("price", p.getPrice());
            map.put("images", p.getImages());
            map.put("category", p.getCategory());
            map.put("location", p.getLocation());
            map.put("condition", p.getCondition());
            map.put("createdAt", p.getCreatedAt());
            map.put("postedAt", p.getCreatedAt().toString());
            map.put("isActive", p.isActive());

            if (user != null) {
                Map<String, Object> sellerMap = new HashMap<>();
                sellerMap.put("_id", user.getId());
                sellerMap.put("name", user.getName());
                sellerMap.put("avatar", user.getAvatar());
                sellerMap.put("location", user.getLocation());

                map.put("sellerId", sellerMap);
            }

            result.add(map);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("products", result);
        response.put("total", total);

        return response;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getProduct(@PathVariable String id) {

        Product p = productService.getProductById(id);
        System.out.println("Product ID: " + p.getId());
        System.out.println("SellerId: " + p.getSellerId());
        User user = null;
        if (p.getSellerId() == null) {
            System.out.println("❌ Product without sellerId: " + p.getId());
        }
        if (p.getSellerId() != null) {
            user = userRepository.findById(p.getSellerId()).orElse(null);
        }

        Map<String, Object> map = new HashMap<>();

        map.put("_id", p.getId());
        map.put("title", p.getTitle());
        map.put("description", p.getDescription());
        map.put("price", p.getPrice());
        map.put("images", p.getImages());
        map.put("category", p.getCategory());
        map.put("location", p.getLocation());
        map.put("condition", p.getCondition());
        map.put("createdAt", p.getCreatedAt());
        map.put("postedAt", p.getCreatedAt().toString());
        map.put("isActive", p.isActive());

        if (user != null) {
            Map<String, Object> sellerMap = new HashMap<>();
            sellerMap.put("_id", user.getId());
            sellerMap.put("name", user.getName());
            sellerMap.put("avatar", user.getAvatar());
            sellerMap.put("location", user.getLocation());

            map.put("sellerId", sellerMap);
        }

        return map;
    }

    @GetMapping("/my")
    public List<Map<String, Object>> getMyProducts(HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");

        List<Product> products = productService.getMyProducts(userId);

        List<Map<String, Object>> result = new ArrayList<>();

        for (Product p : products) {
            Map<String, Object> map = new HashMap<>();

            map.put("_id", p.getId());
            map.put("title", p.getTitle());
            map.put("price", p.getPrice());
            map.put("images", p.getImages());
            map.put("category", p.getCategory());
            map.put("location", p.getLocation());
            map.put("condition", p.getCondition());
            map.put("createdAt", p.getCreatedAt());
            map.put("postedAt", p.getCreatedAt().toString());
            map.put("isActive", p.isActive());

            result.add(map);
        }

        return result;
    }

    @PatchMapping("/{id}/close")
    public String closeProduct(@PathVariable String id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        productService.closeProduct(id, userId);
        return "Product closed";
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable String id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        productService.deleteProduct(id, userId);
        return "Product deleted";
    }
}