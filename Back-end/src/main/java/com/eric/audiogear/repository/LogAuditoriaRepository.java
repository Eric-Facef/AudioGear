package com.eric.audiogear.repository;

import com.eric.audiogear.model.LogAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {
    // Busca os logs ordenados do mais recente para o mais antigo (essencial para o visual de terminal)
    List<LogAuditoria> findByOrderByDataHoraDesc();
}