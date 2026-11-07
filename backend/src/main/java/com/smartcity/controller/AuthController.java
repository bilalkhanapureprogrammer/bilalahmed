package com.smartcity.controller;

import com.smartcity.config.JwtUtil;
import com.smartcity.dto.*;
import com.smartcity.entity.User;
import com.smartcity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body("Email already registered.");

        User user = User.builder()
            .fullName(req.getFullName())
            .email(req.getEmail())
            .password(encoder.encode(req.getPassword()))
            .role(User.Role.valueOf(req.getRole().toUpperCase()))
            .departmentName(req.getDepartmentName())
            .civicPoints(0)
            .build();
        userRepo.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name(), user.getFullName(), user.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return userRepo.findByEmail(req.getEmail())
            .filter(u -> encoder.matches(req.getPassword(), u.getPassword()))
            .map(u -> {
                String token = jwtUtil.generateToken(u.getEmail(), u.getRole().name());
                return ResponseEntity.ok(new AuthResponse(token, u.getRole().name(), u.getFullName(), u.getId()));
            })
            .orElse(ResponseEntity.status(401).build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String header) {
        String token = header.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepo.findByEmail(email)
            .map(u -> ResponseEntity.ok(u))
            .orElse(ResponseEntity.notFound().build());
    }
}