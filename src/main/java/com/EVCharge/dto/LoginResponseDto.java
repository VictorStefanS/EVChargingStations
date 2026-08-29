package com.EVCharge.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor
@AllArgsConstructor @Builder
public class LoginResponseDto {
    private String token;
    // refreshToken is returned internally by services; controllers should avoid sending it to clients in the response body
    private String refreshToken;
}
