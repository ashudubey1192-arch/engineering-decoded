package io.engineeringdecoded.auth;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface LoginAuditRepository extends JpaRepository<LoginAudit,Long> { Page<LoginAudit> findAllByOrderByOccurredAtDesc(Pageable pageable); }
