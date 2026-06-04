package com.eric.audiogear.controller;

import com.eric.audiogear.model.Componente;
import com.eric.audiogear.model.TipoComponente;
import com.eric.audiogear.service.AudioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/componentes")
// 🔥 Liberando os métodos HTTP específicos para evitar bloqueios no navegador
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class ComponenteController {

    private final AudioService audioService;

    public ComponenteController(AudioService audioService) {
        this.audioService = audioService;
    }

    // 🛒 ROTA PARA ADICIONAR COMPONENTES
    @PostMapping
    public ResponseEntity<?> cadastrar(@Valid @RequestBody Componente componente) {
        try {
            Componente salvo = audioService.salvarComponente(componente);
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
            audioService.deletarPorId(id); // Chama o método que vamos verificar/criar no Service
            return ResponseEntity.noContent().build(); // Retorna Status 204 (Sucesso, sem conteúdo)
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao deletar componente: " + e.getMessage());
        }
    }

    // 🔄 NOVA ROTA: ATUALIZAR COMPONENTE (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Componente dadosAtualizados) {
        try {
            Componente atualizado = audioService.atualizarComponente(id, dadosAtualizados);
            return ResponseEntity.ok(atualizado); // Retorna Status 200 com o objeto atualizado
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao atualizar componente.");
        }
    }
}