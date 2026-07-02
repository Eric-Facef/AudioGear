package com.eric.audiogear.controller;

import com.eric.audiogear.model.Componente;
import com.eric.audiogear.model.TipoComponente;
import com.eric.audiogear.model.LogAuditoria; // IMPORTANTE
import com.eric.audiogear.repository.LogAuditoriaRepository; // IMPORTANTE
import com.eric.audiogear.service.AudioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired; // IMPORTANTE
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder; // IMPORTANTE
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/componentes")
// CORS já é tratado de forma global e única em SecurityConfig.corsConfigurationSource()
public class ComponenteController {

    private final AudioService audioService;

    @Autowired
    private LogAuditoriaRepository logAuditoriaRepository; // Injetando o repositório de logs

    public ComponenteController(AudioService audioService) {
        this.audioService = audioService;
    }

    // 🛒 ROTA PARA ADICIONAR COMPONENTES
    @PostMapping
    public ResponseEntity<?> cadastrar(@Valid @RequestBody Componente componente) {
        try {
            Componente salvo = audioService.salvarComponente(componente);

            // 🔵 LOG: Cadastro de Componente
            String usuarioLogado = SecurityContextHolder.getContext().getAuthentication().getName();
            logAuditoriaRepository.save(new LogAuditoria(
                    usuarioLogado,
                    "CADASTRO_PRODUTO",
                    "Adicionou o componente '" + salvo.getNome() + "' (ID: " + salvo.getId() + ")"
            ));

            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // 📦 ROTA PARA ADICIONAR VÁRIOS COMPONENTES DE UMA VEZ
    @PostMapping("/em-massa")
    public ResponseEntity<?> cadastrarVarios(@Valid @RequestBody List<Componente> componentes) {
        try {
            List<Componente> novos = componentes.stream().map(audioService::salvarComponente).toList();

            // 🔵 LOG: Cadastro em Massa
            String usuarioLogado = SecurityContextHolder.getContext().getAuthentication().getName();
            logAuditoriaRepository.save(new LogAuditoria(
                    usuarioLogado,
                    "CADASTRO_EM_MASSA",
                    "Adicionou uma lista com " + novos.size() + " novos componentes de uma só vez."
            ));

            return ResponseEntity.status(HttpStatus.CREATED).body(novos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // ROTA PARA LISTAR TODOS OS COMPONENTES
    @GetMapping
    public ResponseEntity<List<Componente>> listarTodos() {
        return ResponseEntity.ok(audioService.listarTodos());
    }

    // ROTA FILTRADA
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Componente>> listarPorTipo(@PathVariable TipoComponente tipo) {
        return ResponseEntity.ok(audioService.listarPorTipo(tipo));
    }

    // ❌ NOVA ROTA: DELETAR COMPONENTE POR ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        try {
            audioService.deletarPorId(id);

            // 🔵 LOG: Deleção de Componente
            String usuarioLogado = SecurityContextHolder.getContext().getAuthentication().getName();
            logAuditoriaRepository.save(new LogAuditoria(
                    usuarioLogado,
                    "REMOCAO_PRODUTO",
                    "Removeu do catálogo o componente com ID: " + id
            ));

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao deletar componente: " + e.getMessage());
        }
    }

    // 🔄 NOVA ROTA: ATUALIZAR COMPONENTE (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Componente dadosAtualizados) {
        try {
            Componente atualizado = audioService.atualizarComponente(id, dadosAtualizados);

            // 🔵 LOG: Alteração de Componente
            String usuarioLogado = SecurityContextHolder.getContext().getAuthentication().getName();
            logAuditoriaRepository.save(new LogAuditoria(
                    usuarioLogado,
                    "EDICAO_PRODUTO",
                    "Alterou os dados do componente '" + atualizado.getNome() + "' (ID: " + id + ")"
            ));

            return ResponseEntity.ok(atualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao atualizar componente.");
        }
    }
}