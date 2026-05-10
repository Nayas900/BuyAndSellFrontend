package com.nitkkr.marketplace.controller;

import com.nitkkr.marketplace.model.User;
import com.nitkkr.marketplace.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public Map<String, Object> getMe(HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> res = new HashMap<>();
        res.put("_id", user.getId()); // 🔥 important
        res.put("name", user.getName());
        res.put("email", user.getEmail());
        res.put("avatar", user.getAvatar());
        res.put("bio", user.getBio());
        res.put("phone", user.getPhone());
        res.put("location", user.getLocation());
        res.put("createdAt", user.getCreatedAt());

        return res;
    }
}