package com.EVCharge.controller;


import com.EVCharge.dto.UserRegistrationDto;
import com.EVCharge.model.User;
import com.EVCharge.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
public class UserController {

    private final UserService userService;

    @PostMapping("/users")   //binding an HTTP request to an object
    public ResponseEntity<User> createUser(@Valid @RequestBody UserRegistrationDto userRegistrationDto) {
        User createdUser = userService.registerUser(userRegistrationDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }


}
