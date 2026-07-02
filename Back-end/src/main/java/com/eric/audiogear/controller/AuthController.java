package com.eric.audiogear.controller;

import com.eric.audiogear.dto.LoginDto;
import com.eric.audiogear.model.Usuario;
import com.eric.audiogear.model.LogAuditoria; // IMPORTANTE
import com.eric.audiogear.repository.UsuarioRepository;
import com.eric.audiogear.repository.LogAuditoriaRepository; // IMPORTANTE
import com.eric.audiogear.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
// CORS já é tratado de forma global e única em SecurityConfig.corsConfigurationSource()
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LogAuditoriaRepository logAuditoriaRepository; // Injetando o repositório de logs

    @PostMapping("/login")
    public ResponseEntity<?> logar(@RequestBody LoginDto loginDto) {
        try {
            UsernamePasswordAuthenticationToken dadosLogin =
                    new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword());
            Authentication authentication = authenticationManager.authenticate(dadosLogin);
            String token = tokenService.gerarToken(authentication.getName());

            // 🟢 LOG: Sucesso no Login
            logAuditoriaRepository.save(new LogAuditoria(
                    loginDto.getUsername(),
                    "LOGIN_SUCESSO",
                    "Administrador autenticou-se com sucesso no painel."
            ));

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // 🔴 LOG: Falha de Login (Alguém tentando a sorte)
            boolean usuarioExiste = usuarioRepository.findByUsername(loginDto.getUsername()).isPresent();
            String tipoUsuario = usuarioExiste ? loginDto.getUsername() : "DESCONHECIDO";
            String detalheErro = usuarioExiste ? "Senha incorreta digitada." : "Tentativa com usuário inexistente: '" + loginDto.getUsername() + "'";

            logAuditoriaRepository.save(new LogAuditoria(
                    tipoUsuario,
                    "LOGIN_FALHA",
                    "ALERTA: Falha de autenticação. " + detalheErro
            ));

            return ResponseEntity.status(403).body("Usuário ou senha inválidos.");
        }
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrar(@RequestBody LoginDto cadastroDto) {
        if (usuarioRepository.findByUsername(cadastroDto.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Erro: Este nome de usuário já está em uso!");
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setUsername(cadastroDto.getUsername());
        novoUsuario.setPassword(passwordEncoder.encode(cadastroDto.getPassword()));
        novoUsuario.setEmail(cadastroDto.getEmail());

        usuarioRepository.save(novoUsuario);

        // 🔵 LOG: Cadastro de ADM
        String usuarioResponsavel = SecurityContextHolder.getContext().getAuthentication().getName();
        logAuditoriaRepository.save(new LogAuditoria(
                usuarioResponsavel,
                "CADASTRO_USER",
                "Cadastrou um novo usuário administrador: '" + cadastroDto.getUsername() + "'"
        ));

        return ResponseEntity.ok("Usuário cadastrado com sucesso!");
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<?> deletarUsuario(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        if (usuario.isEmpty()) {
            return ResponseEntity.status(404).body("Erro: Usuário não encontrado.");
        }

        String usernameDeletado = usuario.get().getUsername();
        usuarioRepository.deleteById(id);

        // 🔵 LOG: Remoção de ADM
        String usuarioResponsavel = SecurityContextHolder.getContext().getAuthentication().getName();
        logAuditoriaRepository.save(new LogAuditoria(
                usuarioResponsavel,
                "REMOCAO_USER",
                "Removeu o usuário administrador '" + usernameDeletado + "' (ID: " + id + ")"
        ));

        return ResponseEntity.ok("Usuário removido com sucesso!");
    }

    @GetMapping("/usuarios")
    public ResponseEntity<?> listarUsuarios() {
        List<Map<String, Object>> usuarios = usuarioRepository.findAll().stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("email", u.getEmail() != null ? u.getEmail() : "-");
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(usuarios);
    }
}