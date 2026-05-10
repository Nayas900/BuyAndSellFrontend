package com.nitkkr.marketplace.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.http.javanet.NetHttpTransport;

import com.nitkkr.marketplace.dto.AuthResponse;
import com.nitkkr.marketplace.model.User;
import com.nitkkr.marketplace.repository.UserRepository;
import com.nitkkr.marketplace.security.JwtUtil;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${google.client.id}")
    private String googleClientId;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public Object googleLogin(String credential) throws Exception {

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(credential);

        if (idToken == null) {
            throw new RuntimeException("Invalid Google token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();

        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

//        // 🔴 IMPORTANT: Restrict to NIT KKR
//        if (!email.endsWith("@nitkkr.ac.in")) {
//            throw new RuntimeException("Only NIT KKR students allowed");
//        }

        Optional<User> existingUser = userRepository.findByEmail(email);

        User user = existingUser.orElseGet(() -> User.builder()
                .email(email)
                .name(name)
                .avatar(picture)
                .createdAt(java.time.Instant.now())
                .build());

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId());

        Map<String, Object> userMap = new HashMap<>();

        userMap.put("_id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("avatar", user.getAvatar());
        userMap.put("bio", user.getBio());
        userMap.put("phone", user.getPhone());
        userMap.put("location", user.getLocation());
        userMap.put("createdAt", user.getCreatedAt());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userMap);

        return response;
    }
}