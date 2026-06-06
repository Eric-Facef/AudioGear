package com.eric.audiogear.config;

import com.eric.audiogear.model.Usuario;
import com.eric.audiogear.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Verifica se já existe algum usuário para não duplicar toda vez que iniciar
        if (usuarioRepository.count() == 0) {

            Usuario admin = new Usuario();
            admin.setUsername("admin");

            // Aqui a mágica do BCrypt acontece: transformamos "123456" em uma hash segura
            admin.setPassword(passwordEncoder.encode("123456"));

            usuarioRepository.save(admin);
            System.out.println(">>> Usuário padrão 'admin' criado com sucesso! <<<");
        }
    }
}