package com.nitkkr.marketplace.controller;

import com.nitkkr.marketplace.dto.GoogleAuthRequest;
import com.nitkkr.marketplace.service.AuthService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public Object googleAuth(@RequestBody GoogleAuthRequest request) throws Exception {
        return authService.googleLogin(request.getCredential());
    }
}