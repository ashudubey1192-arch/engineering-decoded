package io.engineeringdecoded.user;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByEmailIgnoreCase(String email);
  Optional<User> findByMobile(String mobile);
  Optional<User> findByGoogleSubject(String googleSubject);
  boolean existsByEmailIgnoreCase(String email);
  boolean existsByMobile(String mobile);
  long countByActiveTrue();
}
