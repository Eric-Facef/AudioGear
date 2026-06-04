package com.eric.audiogear.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "componentes") // Nome da tabela no seu PgAdmin
public class Componente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome do componente é obrigatório.")
    @Column(name = "nome", nullable = false)
    private String nome;

    @NotBlank(message = "A marca do componente é obrigatória.")
    @Column(name = "marca", nullable = false)
    private String marca;

    @NotNull(message = "O tipo do componente é obrigatório.")
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoComponente tipo;

    @NotNull(message = "A potência RMS é obrigatória.")
    @Min(value = 1, message = "A potência deve ser maior que 0.")
    @Column(name = "potencia_rms", nullable = false)
    private Integer potenciaRms;

    @NotNull(message = "A impedância é obrigatória.")
    @Min(value = 1, message = "A impedância deve ser maior que 0.")
    @Column(name = "impedancia", nullable = false)
    private Integer impedancia;

    // Coluna para quantidade de canais (módulos).
    // No Postgres, se for um alto-falante, este campo aceitará valor nulo.
    @Column(name = "canais", nullable = true)
    private Integer canais;

    public Componente() {
    }

    public Componente(Long id, String nome, String marca, TipoComponente tipo, Integer potenciaRms, Integer impedancia, Integer canais) {
        this.id = id;
        this.nome = nome;
        this.marca = marca;
        this.tipo = tipo;
        this.potenciaRms = potenciaRms;
        this.impedancia = impedancia;
        this.canais = canais;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public TipoComponente getTipo() {
        return tipo;
    }

    public void setTipo(TipoComponente tipo) {
        this.tipo = tipo;
    }

    public Integer getPotenciaRms() {
        return potenciaRms;
    }

    public void setPotenciaRms(Integer potenciaRms) {
        this.potenciaRms = potenciaRms;
    }

    public Integer getImpedancia() {
        return impedancia;
    }

    public void setImpedancia(Integer impedancia) {
        this.impedancia = impedancia;
    }

    public Integer getCanais() {
        return canais;
    }

    public void setCanais(Integer canais) {
        this.canais = canais;
    }
}