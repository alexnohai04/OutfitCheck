package org.example.outfitcheck.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "12345678901234567890123456789012"; // Min. 32 chars!
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 ore

    private final Key key;

    public JwtUtil() {
        this.key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes()); // ✅ Convertim secretul direct în bytes
    }

    public String generateToken(String username, Long userId) {
        return Jwts.builder()
                .setSubject(username) // Email-ul sau username-ul rămâne subiectul
                .claim("id", userId)  // ✅ Adaugă ID-ul utilizatorului în claims
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Long extractUserId(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("id", Long.class); // ✅ Extrage ID-ul utilizatorului
    }


    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
