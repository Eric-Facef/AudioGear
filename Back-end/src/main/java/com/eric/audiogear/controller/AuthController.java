package com.eric.audiogear.controller;

import com.eric.audiogear.dto.LoginDto;
import com.eric.audiogear.model.Usuario;
import com.eric.audiogear.repository.UsuarioRepository;
import com.eric.audiogear.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> logar(@RequestBody LoginDto loginDto) {
        try {
            UsernamePasswordAuthenticationToken dadosLogin =
                    new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword());
            Authentication authentication = authenticationManager.authenticate(dadosLogin);
            String token = tokenService.gerarToken(authentication.getName());

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
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
        return ResponseEntity.ok("Usuário cadastrado com sucesso!");
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<?> deletarUsuario(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        if (usuario.isEmpty()) {
            return ResponseEntity.status(404).body("Erro: Usuário não encontrado.");
        }
        usuarioRepository.deleteById(id);
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