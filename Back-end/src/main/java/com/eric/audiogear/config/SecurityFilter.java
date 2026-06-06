package com.eric.audiogear.config;

import com.eric.audiogear.service.AutenticacaoService;
import com.eric.audiogear.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private AutenticacaoService autenticacaoService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = recuperarToken(request);

        if (token != null && tokenService.isTokenValido(token)) {
            String username = tokenService.getUsernameDoToken(token);
            UserDetails usuario = autenticacaoService.loadUserByUsername(username);

            // CORREÇÃO AQUI: Passamos o objeto do utilizador, a sua password/credenciais e os seus privilégios (authorities)
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(usuario, usuario.getPassword(), usuario.getAuthorities());

            // Vincula os detalhes da requisição HTTP ao contexto de autenticação do Spring
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Salva a autenticação de forma explícita no contexto de segurança do Spring
            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("[SECURITY FILTER] Utilizador autenticado com sucesso: " + username);
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            if (token.trim().isEmpty() || token.equals("null") || token.equals("undefined")) {
                return null;
            }
            return token;
        }
        return null;
    }
}