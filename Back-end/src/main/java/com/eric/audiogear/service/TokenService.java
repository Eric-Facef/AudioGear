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
        // .trim() protege contra espaco/quebra de linha extra que podem entrar
        // sem querer ao colar o valor em variaveis de ambiente (Render, etc.)
        String secretLimpo = secret == null ? "" : secret.trim();

        if (secretLimpo.isEmpty()) {
            throw new IllegalStateException(
                    "jwt.secret nao foi configurado. Defina a variavel de ambiente JWT_SECRET."
            );
        }

        try {
            this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretLimpo));
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                    "jwt.secret nao e um Base64 valido. Gere uma nova chave com "
                            + "'openssl rand -base64 32' e confira se nao ha espacos/quebras de linha extras "
                            + "ao colar o valor na variavel de ambiente JWT_SECRET.", e
            );
        }
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