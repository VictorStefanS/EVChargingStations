package com.EVCharge.controller;


import com.EVCharge.dto.LoginRequestDto;
import com.EVCharge.dto.LoginResponseDto;
import com.EVCharge.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CookieValue;

import org.springframework.http.ResponseCookie;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final com.EVCharge.service.JwtService jwtService;

    @PostMapping("/login")
    public LoginResponseDto login(@Valid @RequestBody LoginRequestDto request, HttpServletResponse response) {
        var resp = authenticationService.login(request);
        // set HttpOnly refresh cookie and do not expose refresh token in response body
        if (resp.getRefreshToken() != null) {
            ResponseCookie cookie = ResponseCookie.from("refreshToken", resp.getRefreshToken())
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60) // 7 days
                    .sameSite("Strict")
                    .build();
            response.addHeader("Set-Cookie", cookie.toString());
        }
        return LoginResponseDto.builder().token(resp.getToken()).build();
    }

    @PostMapping("/refresh")
    public LoginResponseDto refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new RuntimeException("No refresh token");
        }
        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        // validate and rotate using stored tokens
        var resp = authenticationService.refreshWithToken(refreshToken);
        if (resp.getRefreshToken() != null) {
            ResponseCookie cookie = ResponseCookie.from("refreshToken", resp.getRefreshToken())
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .sameSite("Strict")
                    .build();
            response.addHeader("Set-Cookie", cookie.toString());
        }
        return LoginResponseDto.builder().token(resp.getToken()).build();
    }

    @PostMapping("/logout")
    public void logout(@CookieValue(name = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {
        // revoke server-side token and clear cookie
        if (refreshToken != null && !refreshToken.isEmpty()) {
            authenticationService.revokeRefreshToken(refreshToken);
        }
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}

