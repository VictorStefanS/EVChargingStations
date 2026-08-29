package com.EVCharge.service;

import com.EVCharge.dto.LoginRequestDto;
import com.EVCharge.dto.LoginResponseDto;
import com.EVCharge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.EVCharge.model.RefreshToken;
import com.EVCharge.repository.RefreshTokenRepository;

import java.time.Instant;
import java.util.Optional;



@Service
@RequiredArgsConstructor
public class AuthenticationService {


    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    private final UserDetailsService userDetailsService;

    private final UserRepository userRepository;

    private final RefreshTokenRepository refreshTokenRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public LoginResponseDto login(LoginRequestDto request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        // persist hashed refresh token
        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setTokenHash(passwordEncoder.encode(refreshToken));
        rt.setExpiresAt(Instant.now().plusSeconds(7 * 24 * 60 * 60));
        rt.setRevoked(false);
        rt.setCreatedAt(Instant.now());
        refreshTokenRepository.save(rt);

        return LoginResponseDto.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * Validate provided raw refresh token, rotate it and return new tokens.
     */
    public LoginResponseDto refreshWithToken(String rawRefreshToken) {
        if (rawRefreshToken == null) throw new RuntimeException("No refresh token provided");
        if (!jwtService.isRefreshToken(rawRefreshToken)) throw new RuntimeException("Invalid refresh token format");

        String email = jwtService.extractEmail(rawRefreshToken);
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // find not-revoked tokens for user and check match
        var candidates = refreshTokenRepository.findByUserAndRevokedFalse(user);
        Optional<RefreshToken> matched = candidates.stream()
                .filter(r -> !r.getExpiresAt().isBefore(Instant.now()))
                .filter(r -> passwordEncoder.matches(rawRefreshToken, r.getTokenHash()))
                .findFirst();

        if (matched.isEmpty()) throw new RuntimeException("Refresh token not found or revoked/expired");

        // revoke old
        RefreshToken old = matched.get();
        old.setRevoked(true);
        refreshTokenRepository.save(old);

        // issue new tokens
        var accessToken = jwtService.generateToken(user);
        var newRefresh = jwtService.generateRefreshToken(user);

        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setTokenHash(passwordEncoder.encode(newRefresh));
        rt.setExpiresAt(Instant.now().plusSeconds(7 * 24 * 60 * 60));
        rt.setRevoked(false);
        rt.setCreatedAt(Instant.now());
        refreshTokenRepository.save(rt);

        return LoginResponseDto.builder().token(accessToken).refreshToken(newRefresh).build();
    }

    public void revokeRefreshToken(String rawRefreshToken) {
        if (rawRefreshToken == null) return;
        try {
            String email = jwtService.extractEmail(rawRefreshToken);
            var user = userRepository.findByEmail(email).orElse(null);
            if (user == null) return;
            var candidates = refreshTokenRepository.findByUserAndRevokedFalse(user);
            candidates.stream()
                    .filter(r -> passwordEncoder.matches(rawRefreshToken, r.getTokenHash()))
                    .forEach(r -> { r.setRevoked(true); refreshTokenRepository.save(r); });
        } catch (Exception ignored) {}
    }

}