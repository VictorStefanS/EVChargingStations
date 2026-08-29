package com.EVCharge.repository;

import com.EVCharge.model.RefreshToken;
import com.EVCharge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    List<RefreshToken> findByUserAndRevokedFalse(User user);
}