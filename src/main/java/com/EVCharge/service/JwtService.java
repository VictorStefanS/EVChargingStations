package com.EVCharge.service;


import com.EVCharge.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret.key}")
    private String secretKey;

    public String generateToken(User user) {
        String roleName = (user.getRole() != null) ? user.getRole().name() : "USER";
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", roleName)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

}
