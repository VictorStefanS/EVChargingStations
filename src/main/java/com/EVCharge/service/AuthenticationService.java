package com.EVCharge.service;

import com.EVCharge.dto.LoginRequestDto;
import com.EVCharge.dto.LoginResponseDto;
import com.EVCharge.model.User;
import com.EVCharge.repository.UserRepository;
import com.EVCharge.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;



@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;

    private final JwtService jwtService;

    private final BCryptPasswordEncoder bCryptPasswordEncoder;


    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Verificăm dacă parola trimisă se potrivește cu cea criptată din DB
        if (!bCryptPasswordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }


        String token = jwtService.generateToken(user);


        return new LoginResponseDto(token);
    }

}