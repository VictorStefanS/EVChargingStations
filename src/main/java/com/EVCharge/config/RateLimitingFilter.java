package com.EVCharge.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiter per IP.
 * Limits: 120 requests per 60 seconds per IP by default.
 * Note: suitable for small demo/portfolio use. Use a distributed store (Redis) in production.
 */
@Component
@Order(1)
public class RateLimitingFilter extends HttpFilter {

    private static final long WINDOW_SECONDS = 60;
    private static final int MAX_REQUESTS = 120;

    private static class Entry {
        volatile long windowStart;
        volatile int count;

        Entry(long windowStart, int count) {
            this.windowStart = windowStart;
            this.count = count;
        }

        synchronized boolean allow() {
            long now = Instant.now().getEpochSecond();
            if (now - windowStart >= WINDOW_SECONDS) {
                windowStart = now;
                count = 1;
                return true;
            } else {
                if (count < MAX_REQUESTS) {
                    count++;
                    return true;
                }
                return false;
            }
        }
    }

    private final Map<String, Entry> store = new ConcurrentHashMap<>();

    @Override
    protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        String ip = extractIp(request);
        Entry e = store.computeIfAbsent(ip, k -> new Entry(Instant.now().getEpochSecond(), 0));
        if (!e.allow()) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"rate_limit_exceeded\",\"message\":\"Too many requests. Try again later.\"}");
            return;
        }
        chain.doFilter(request, response);
    }

    private String extractIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
