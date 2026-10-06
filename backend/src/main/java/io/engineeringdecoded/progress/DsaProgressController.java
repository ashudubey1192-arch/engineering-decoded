package io.engineeringdecoded.progress;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController @RequestMapping("/api/dsa/progress")
public class DsaProgressController {
  private final JdbcTemplate jdbc;
  private static final Set<String> CATEGORIES = Set.of("drafts","solved","quizzes","lessons","reviews","interviews","preferences");
  public DsaProgressController(JdbcTemplate jdbc) { this.jdbc = jdbc; }
  public record Entry(@NotBlank @Size(max=30) String category, @NotBlank @Size(max=240) String entryKey, @NotNull @Size(max=24000) String value, @Positive long updatedAt) {}
  public record Update(@NotNull @Size(max=100) List<@Valid Entry> entries) {}
  @GetMapping public List<Entry> list(@AuthenticationPrincipal Jwt jwt) { return entries(UUID.fromString(jwt.getSubject())); }
  private List<Entry> entries(UUID user) {
    return jdbc.query("SELECT category, entry_key, value, client_updated_at FROM dsa_learning_state WHERE user_id=?", (rs,row) -> new Entry(rs.getString(1),rs.getString(2),rs.getString(3),rs.getLong(4)),user);
  }
  @PutMapping @Transactional public List<Entry> update(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody Update request) {
    UUID user = UUID.fromString(jwt.getSubject());
    jdbc.queryForObject("SELECT id FROM users WHERE id=? FOR UPDATE", UUID.class, user);
    if (request.entries().stream().mapToInt(e -> e.value().length()).sum() > 500000) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"Progress batch is too large");
    for (Entry e : request.entries()) {
      if (!CATEGORIES.contains(e.category()) || Set.of("__proto__","constructor","prototype").contains(e.entryKey()) || e.updatedAt() > System.currentTimeMillis()+300000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid progress entry or device clock");
      jdbc.update("INSERT INTO dsa_learning_state(user_id,category,entry_key,value,client_updated_at) VALUES (?,?,?,?,?) ON CONFLICT (user_id,category,entry_key) DO UPDATE SET value=EXCLUDED.value, client_updated_at=EXCLUDED.client_updated_at WHERE EXCLUDED.client_updated_at > dsa_learning_state.client_updated_at",user,e.category(),e.entryKey(),e.value(),e.updatedAt());
    }
    Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM dsa_learning_state WHERE user_id=?",Integer.class,user);
    if (count != null && count > 4000) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"Progress entry limit reached");
    return entries(user);
  }
}
