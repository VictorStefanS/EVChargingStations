package com.EVCharge.service;


import com.EVCharge.dto.UserRegistrationDto;
import com.EVCharge.model.User;
import com.EVCharge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.EVCharge.model.UserRole;

@Service
@RequiredArgsConstructor
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
         user.setRole(UserRole.ROLE_USER);
         userRepository.save(user);
         return user;
    }
}

