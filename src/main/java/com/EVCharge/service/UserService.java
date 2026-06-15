package com.EVCharge.service;


import com.EVCharge.dto.UserRegistrationDto;
import com.EVCharge.model.User;
import com.EVCharge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public User registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
         User user = new User();
         user.setFirstName(registrationDto.getFirstName());
         user.setLastName(registrationDto.getLastName());
         user.setEmail(registrationDto.getEmail());
         String cryptedPassword = passwordEncoder.encode(registrationDto.getPassword());
         user.setPassword(cryptedPassword);
         userRepository.save(user);
         return user;
    }
}

