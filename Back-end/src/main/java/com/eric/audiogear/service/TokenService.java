package com.eric.audiogear.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Service
public class TokenService {

    // ⚠️ CORRIGIDO: a chave não fica mais hardcoded no código-fonte.
    // Ela agora vem do application-*.properties / variável de ambiente JWT_SECRET.
    @Value("${jwt.secret}")
    private String secret;

    private Key key;

    // O token vai expirar em 2 horas (em milissegundos)
    private final long expirationTime = 7200000;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
    }

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