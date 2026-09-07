package io.engineeringdecoded.admin;
import io.engineeringdecoded.auth.*;
import io.engineeringdecoded.progress.LearningProgressRepository;
import io.engineeringdecoded.user.*;
import java.util.UUID;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/admin")
public class AdminController {
  private final UserRepository users; private final LoginAuditRepository audits; private final LearningProgressRepository progress;
  public AdminController(UserRepository users,LoginAuditRepository audits,LearningProgressRepository progress){this.users=users;this.audits=audits;this.progress=progress;}
  public record Stats(long users,long activeUsers,long progressRecords,long completedArticles){}
  public record UserAdminView(UUID id,String displayName,String email,String mobile,String role,boolean active,java.time.Instant createdAt,java.time.Instant lastLoginAt){static UserAdminView of(User u){return new UserAdminView(u.getId(),u.getDisplayName(),u.getEmail(),u.getMobile(),u.getRole().name(),u.isActive(),u.getCreatedAt(),u.getLastLoginAt());}}
  public record UserPatch(Boolean active,Role role){}
  @GetMapping("/stats") public Stats stats(){return new Stats(users.count(),users.countByActiveTrue(),progress.count(),progress.countByCompletedTrue());}
  @GetMapping("/users") public Page<UserAdminView> users(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="25") int size){return users.findAll(PageRequest.of(page,Math.min(size,100),Sort.by(Sort.Direction.DESC,"createdAt"))).map(UserAdminView::of);}
  @PatchMapping("/users/{id}") public UserAdminView update(@PathVariable UUID id,@RequestBody UserPatch patch){var user=users.findById(id).orElseThrow();if(patch.active()!=null)user.setActive(patch.active());if(patch.role()!=null)user.setRole(patch.role());return UserAdminView.of(users.save(user));}
  @GetMapping("/login-audit") public Page<LoginAudit> audit(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="50") int size){return audits.findAllByOrderByOccurredAtDesc(PageRequest.of(page,Math.min(size,100)));}
}
