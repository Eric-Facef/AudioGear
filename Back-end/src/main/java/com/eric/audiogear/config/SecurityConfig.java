package com.eric.audiogear.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Vincula explicitamente a configuração de CORS do Bean abaixo
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 2. Desativa o CSRF pois usamos autenticação baseada em tokens (Stateless)
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Libera requisições OPTIONS preliminares feitas pelo navegador
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Libera endpoints de autenticação públicos (com e sem prefixo /api)
                        .requestMatchers("/auth/**", "/api/auth/**").permitAll()

                        // Libera consultas do catálogo (GET) para visitantes
                        .requestMatchers(HttpMethod.GET, "/api/componentes/**", "/componentes/**").permitAll()

                        // Qualquer outra requisição (POST para salvar, DELETE, PUT) EXIGE o Token JWT
                        .anyRequest().authenticated()
                )
                // Injeta o nosso filtro customizado antes do processador de utilizador/senha padrão do Spring
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ==========================================================================
    // 🌍 CONFIGURAÇÃO GLOBAL DE CORS - EVITA BLOQUEIOS ENTRE FRONT E BACKEND
    // ==========================================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Permite o acesso a partir de qualquer origem externa (Live Server, ficheiro local, etc.)
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));

        // Libera todos os verbos HTTP que o teu sistema usa
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Permite os cabeçalhos essenciais, incluindo o Authorization para o Token Bearer
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));

        // Permite o envio de credenciais (Tokens/Cookies) caso necessário futuramente
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}