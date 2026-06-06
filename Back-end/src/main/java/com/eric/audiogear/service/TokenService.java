package com.eric.audiogear.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Service
public class TokenService {

    // Chave fixa em Base64 — tokens continuam válidos mesmo após reiniciar o servidor
    private final Key key = Keys.hmacShaKeyFor(
            Base64.getDecoder().decode("dUd3UEF1ZGlvR2VhckNoYXZlU2VjcmV0YUZpeGEyMDI0IQ==")
    );

    // O token vai expirar em 2 horas (em milissegundos)
    private final long expirationTime = 7200000;

    public String gerarToken(String username) {
        return Jwts.builder().setSubject(username).setIssuedAt(new Date()).
                setExpiration(new Date(System.currentTimeMillis() + expirationTime)).signWith(key).compact();
    }

    public boolean isTokenValido(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsernameDoToken(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        return claims.getSubject();
    }
}