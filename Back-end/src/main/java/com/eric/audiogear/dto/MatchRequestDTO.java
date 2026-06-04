package com.eric.audiogear.dto;

import jakarta.validation.constraints.NotNull;

public class MatchRequestDTO {

    @NotNull(message = "O ID do módulo é obrigatório.")
    private Long idModulo;

    @NotNull(message = "O ID do alto-falante é obrigatório.")
    private Long idAltoFalante;

    // --- CONSTRUTOR PADRÃO (Obrigatório para o Spring) ---
    public MatchRequestDTO() {
    }

    public MatchRequestDTO(Long idModulo, Long idAltoFalante) {
        this.idModulo = idModulo;
        this.idAltoFalante = idAltoFalante;
    }

    // --- GETTERS E SETTERS ---
    public Long getIdModulo() {
        return idModulo;
    }

    public void setIdModulo(Long idModulo) {
        this.idModulo = idModulo;
    }

    public Long getIdAltoFalante() {
        return idAltoFalante;
    }

    public void setIdAltoFalante(Long idAltoFalante) {
        this.idAltoFalante = idAltoFalante;
    }
}