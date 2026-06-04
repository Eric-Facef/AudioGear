package com.eric.audiogear.controller;

import com.eric.audiogear.dto.MatchRequestDTO;
import com.eric.audiogear.dto.MatchResponseDTO;
import com.eric.audiogear.service.AudioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/match")
@CrossOrigin(origins = "*")
public class MatchController {

    private final AudioService audioService;

    public MatchController(AudioService audioService) {
        this.audioService = audioService;
    }

    // ROTA QUE FAZ O CÁLCULO TÉCNICO
    @PostMapping("/check")
    public ResponseEntity<MatchResponseDTO> verificarCompatibilidade(@Valid @RequestBody MatchRequestDTO request) {
        MatchResponseDTO resposta = audioService.calcularCompatibilidade(request);
        return ResponseEntity.ok(resposta);
    }
}