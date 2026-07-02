package com.eric.audiogear.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "logs_auditoria")
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_adm", nullable = false)
    private String usuarioAdm;

    @Column(nullable = false)
    private String acao;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descricao;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora = LocalDateTime.now();

    // Construtores
    public LogAuditoria() {}

    public LogAuditoria(String usuarioAdm, String acao, String descricao) {
        this.usuarioAdm = usuarioAdm;
        this.acao = acao;
        this.descricao = descricao;
        this.dataHora = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsuarioAdm() { return usuarioAdm; }
    public void setUsuarioAdm(String usuarioAdm) { this.usuarioAdm = usuarioAdm; }
    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
}