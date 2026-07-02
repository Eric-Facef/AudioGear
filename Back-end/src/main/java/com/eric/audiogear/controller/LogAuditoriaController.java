package com.eric.audiogear.controller;

import com.eric.audiogear.model.LogAuditoria;
import com.eric.audiogear.repository.LogAuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
// CORS já é tratado de forma global e única em SecurityConfig.corsConfigurationSource()
public class LogAuditoriaController {

    @Autowired
    private LogAuditoriaRepository logAuditoriaRepository;

    @GetMapping
    public ResponseEntity<?> listarLogs(Authentication authentication) {
        // Bloqueio de segurança redundante no Back-End: Só o Eric acessa as informações brutas
        if (authentication == null || !authentication.getName().equalsIgnoreCase("Eric Meleti")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Acesso negado: Apenas o provedor principal possui permissão para auditoria.");
        }

        List<LogAuditoria> logs = logAuditoriaRepository.findByOrderByDataHoraDesc();
        return ResponseEntity.ok(logs);
    }
}