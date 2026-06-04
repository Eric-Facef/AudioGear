package com.eric.audiogear.dto;

public class MatchResponseDTO {

    private String resultado; // Ex: PERFEITO, PERIGO, COMPATÍVEL COM PERDA
    private String descricao; // A explicação técnica detalhada que o Service calcula

    // --- CONSTRUTORES ---
    public MatchResponseDTO() {
    }

    public MatchResponseDTO(String resultado, String descricao) {
        this.resultado = resultado;
        this.descricao = descricao;
    }

    // --- GETTERS E SETTERS ---
    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}