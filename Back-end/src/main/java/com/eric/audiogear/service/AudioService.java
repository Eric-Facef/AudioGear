package com.eric.audiogear.service;

import com.eric.audiogear.dto.MatchRequestDTO;
import com.eric.audiogear.dto.MatchResponseDTO;
import com.eric.audiogear.model.Componente;
import com.eric.audiogear.model.TipoComponente;
import com.eric.audiogear.repository.ComponenteRepository; // 🛒 Atualizado para ComponenteRepository
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AudioService {

    // 🛒 Atualizado para ComponenteRepository
    private final ComponenteRepository componenteRepository;

    // 🛒 Construtor atualizado com o nome correto
    public AudioService(ComponenteRepository componenteRepository) {
        this.componenteRepository = componenteRepository;
    }

    // --- MÉTODOS DO CRUD ---

    public Componente salvarComponente(Componente componente) {
        // 1. Validação Profissional: Verifica se já existe no banco
        boolean jaExiste = componenteRepository.existsByMarcaIgnoreCaseAndNomeIgnoreCase(
                componente.getMarca(),
                componente.getNome()
        );
        if (jaExiste) {
            // Lança uma exceção para parar a execução imediatamente
            throw new IllegalArgumentException("Erro: O componente '" + componente.getMarca() + " " + componente.getNome() + "' já está cadastrado!");
        }
        if (componente.getTipo() == TipoComponente.ALTO_FALANTE) {
            componente.setCanais(null);
        }
        return componenteRepository.save(componente);
    }

    public List<Componente> listarTodos() {
        return componenteRepository.findAll();
    }

    public List<Componente> listarPorTipo(TipoComponente tipo) {
        return componenteRepository.findByTipo(tipo);
    }

    public Optional<Componente> buscarPorId(Long id) {
        return componenteRepository.findById(id);
    }

    public void deletarComponente(Long id) {
        componenteRepository.deleteById(id);
    }

    // --- A REGRA DE NEGÓCIO DO MATCH (CÁLCULO DE SOM) ---

    public MatchResponseDTO calcularCompatibilidade(MatchRequestDTO request) {
        Componente modulo = componenteRepository.findById(request.getIdModulo())
                .orElseThrow(() -> new IllegalArgumentException("Módulo amplificador não encontrado."));

        Componente falante = componenteRepository.findById(request.getIdAltoFalante())
                .orElseThrow(() -> new IllegalArgumentException("Alto-falante não encontrado."));

        if (modulo.getTipo() != TipoComponente.AMPLIFICADOR || falante.getTipo() != TipoComponente.ALTO_FALANTE) {
            return new MatchResponseDTO("ERRO DE SELEÇÃO", "Certifique-se de selecionar um MÓDULO e um ALTO-FALANTE.");
        }

        int impModulo = modulo.getImpedancia();
        int impFalante = falante.getImpedancia();

        int canaisModulo = (modulo.getCanais() != null && modulo.getCanais() > 0) ? modulo.getCanais() : 1;
        int potModuloPorCanal = modulo.getPotenciaRms() / canaisModulo;
        int potFalante = falante.getPotenciaRms();

        // REGRA 1: Impedância abaixo do mínimo
        if (impFalante < impModulo) {
            return new MatchResponseDTO(
                    "PERIGO",
                    "Incompatível! A impedância do alto-falante (" + impFalante + " Ohms) é menor que a suportada pelo canal do módulo (" + impModulo + " Ohms). Isso vai superaquecer e queimar o módulo!"
            );
        }

        // REGRA 2: Casamento Perfeito de Impedância
        if (impFalante == impModulo) {
            if (potModuloPorCanal >= potFalante) {
                return new MatchResponseDTO(
                        "PERFEITO",
                        "Casamento exato de " + impModulo + " Ohms! O módulo envia " + potModuloPorCanal + "W RMS por canal e o falante suporta " + potFalante + "W RMS. Rendimento máximo e seguro!"
                );
            } else {
                return new MatchResponseDTO(
                        "COMPATÍVEL MAS LIMITADO",
                        "A impedância casou (" + impModulo + " Ohms), mas o módulo envia apenas " + potModuloPorCanal + "W RMS por canal, enquanto o falante precisa de " + potFalante + "W RMS. Vai tocar, mas com falta de força (risco de distorção/clipar se aumentar muito)."
                );
            }
        }

        // REGRA 3: Impedância acima do mínimo
        if (impFalante > impModulo) {
            int potReduzida = potModuloPorCanal / 2;
            return new MatchResponseDTO(
                    "COMPATÍVEL COM PERDA",
                    "Seguro, mas haverá perda. O alto-falante tem impedância maior (" + impFalante + " Ohms) que o canal (" + impModulo + " Ohms). O sistema funciona sem queimar, mas o módulo só vai entregar cerca de " + potReduzida + "W RMS para este falante."
            );
        }

        return new MatchResponseDTO("INDETERMINADO", "Não foi possível calcular com os dados informados.");
    }

    // Método para deletar
    public void deletarPorId(Long id) {
        // Se o seu repositório for o padrão do Spring Data JPA:
        componenteRepository.deleteById(id);
    }

    // Método para atualizar (Edição Parcial/Total)
    public Componente atualizarComponente(Long id, Componente dadosNovos) {
        // 1. Busca o componente que já existe no Postgres
        Componente existente = componenteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Componente não encontrado com o ID: " + id));

        // 2. Sobrescreve absolutamente todos os parâmetros com o que veio do JavaScript
        existente.setNome(dadosNovos.getNome());
        existente.setMarca(dadosNovos.getMarca());
        existente.setTipo(dadosNovos.getTipo());
        existente.setPotenciaRms(dadosNovos.getPotenciaRms());
        existente.setImpedancia(dadosNovos.getImpedancia());
        existente.setCanais(dadosNovos.getCanais()); // Se for alto-falante, o JS mandou null e vai atualizar para null corretamente

        // 3. Salva o objeto existente modificado (O Hibernate vai rodar um UPDATE certeiro no banco)
        return componenteRepository.save(existente);
    }
}