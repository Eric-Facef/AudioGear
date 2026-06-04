package com.eric.audiogear.repository;

import com.eric.audiogear.model.Componente;
import com.eric.audiogear.model.TipoComponente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComponenteRepository extends JpaRepository<Componente, Long> {
    List<Componente> findByTipo(TipoComponente tipo);
    boolean existsByMarcaIgnoreCaseAndNomeIgnoreCase(String marca, String nome);
}
