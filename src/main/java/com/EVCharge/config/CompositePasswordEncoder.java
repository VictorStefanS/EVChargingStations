package com.EVCharge.config;

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Composite encoder: encode with Argon2, but when matching try Argon2 first then fall back to BCrypt.
 * This allows migration from existing BCrypt hashes (which may be present without prefixes) while
 * encoding new passwords with Argon2 (no 72-byte limit).
 */
public class CompositePasswordEncoder implements PasswordEncoder {

    private final Argon2PasswordEncoder argon2;
    private final BCryptPasswordEncoder bcrypt;

    public CompositePasswordEncoder() {
        // Argon2 params: use sensible defaults from Spring
        // Argon2 parameters: saltLength=16, hashLength=32, parallelism=1, memory=4096, iterations=3
        this.argon2 = new Argon2PasswordEncoder(16, 32, 1, 1 << 12, 3);
        this.bcrypt = new BCryptPasswordEncoder();
    }

    @Override
    public String encode(CharSequence rawPassword) {
        // use Argon2 for all new encodings to avoid bcrypt 72-byte limit
        return argon2.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword == null) return false;
        // try Argon2 first
        try {
            if (argon2.matches(rawPassword, encodedPassword)) return true;
        } catch (Exception ignored) {}
        // fallback to bcrypt if the stored hash looks like bcrypt ($2a$, $2b$, $2y$)
        if (encodedPassword.startsWith("$2a$") || encodedPassword.startsWith("$2b$") || encodedPassword.startsWith("$2y$")) {
            try {
                return bcrypt.matches(rawPassword, encodedPassword);
            } catch (Exception ignored) {
                return false;
            }
        }
        return false;
    }
}
