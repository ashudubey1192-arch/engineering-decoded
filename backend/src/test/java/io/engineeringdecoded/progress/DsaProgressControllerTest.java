package io.engineeringdecoded.progress;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

class DsaProgressControllerTest {
  private Jwt jwt(UUID id) {return Jwt.withTokenValue("test").header("alg","HS256").subject(id.toString()).build();}
  @Test void listIsScopedToAuthenticatedSubject() {
    var db=mock(JdbcTemplate.class);var user=UUID.randomUUID();
    new DsaProgressController(db).list(jwt(user));
    verify(db).query(contains("WHERE user_id=?"),any(RowMapper.class),eq(user));
  }
  @Test void updateUsesTimestampConflictRuleAndAuthenticatedOwner() {
    var db=mock(JdbcTemplate.class);var user=UUID.randomUUID();
    var entry=new DsaProgressController.Entry("drafts","array-min","\"code\"",1L);
    new DsaProgressController(db).update(jwt(user),new DsaProgressController.Update(List.of(entry)));
    verify(db).update(contains("WHERE EXCLUDED.client_updated_at > dsa_learning_state.client_updated_at"),eq(user),eq("drafts"),eq("array-min"),eq("\"code\""),eq(1L));
  }
  @Test void rejectsUnexpectedCategoryAndFutureTimestamp() {
    var controller=new DsaProgressController(mock(JdbcTemplate.class));
    for(var entry:List.of(new DsaProgressController.Entry("tokens","a","x",1),new DsaProgressController.Entry("drafts","a","x",System.currentTimeMillis()+600000))) {
      assertThrows(ResponseStatusException.class,()->controller.update(jwt(UUID.randomUUID()),new DsaProgressController.Update(List.of(entry))));
    }
  }
  @Test void unconfiguredRunnerDoesNotExecutePrograms() {
    var runner=new JavaRunnerController("","");
    assertEquals(false,runner.status().get("available"));
    assertThrows(ResponseStatusException.class,()->runner.run(new JavaRunnerController.Run("class Main {}",List.of())));
  }
}
