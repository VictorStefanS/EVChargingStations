package com.EVCharge.dto;


import lombok.*;

@Data @NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {
    private String email;
    private String password;
}
