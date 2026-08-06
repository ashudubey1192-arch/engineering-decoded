package io.engineeringdecoded.progress;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/progress")
public class ProgressController {
  private final LearningProgressRepository progress;
  public ProgressController(LearningProgressRepository progress){this.progress=progress;}
  public record UpdateRequest(@NotBlank String moduleSlug,@NotBlank String courseSlug,@NotBlank String sectionSlug,@NotBlank String articleSlug,@Min(0) @Max(100) short progressPercent,@PositiveOrZero int lastPosition,boolean completed){}
  public record Summary(long completedArticles,long completedCourses,long trackedArticles){}
  @GetMapping public List<LearningProgress> list(@AuthenticationPrincipal Jwt jwt){return progress.findByUserIdOrderByUpdatedAtDesc(UUID.fromString(jwt.getSubject()));}
  @GetMapping("/summary") public Summary summary(@AuthenticationPrincipal Jwt jwt){UUID id=UUID.fromString(jwt.getSubject());return new Summary(progress.countByUserIdAndCompletedTrue(id),progress.completedCourseCount(id),progress.findByUserIdOrderByUpdatedAtDesc(id).size());}
  @PutMapping public LearningProgress update(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody UpdateRequest request){
    UUID userId=UUID.fromString(jwt.getSubject()); var item=progress.findByUserIdAndModuleSlugAndCourseSlugAndArticleSlug(userId,request.moduleSlug(),request.courseSlug(),request.articleSlug()).orElseGet(LearningProgress::new);
    if(item.getId()==null){item.setUserId(userId);item.setModuleSlug(request.moduleSlug());item.setCourseSlug(request.courseSlug());item.setSectionSlug(request.sectionSlug());item.setArticleSlug(request.articleSlug());}
    item.update(request.progressPercent(),request.lastPosition(),request.completed()); return progress.save(item);
  }
  @DeleteMapping("/{id}") public void delete(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id){var item=progress.findById(id).orElseThrow();if(!item.getUserId().equals(UUID.fromString(jwt.getSubject())))throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN);progress.delete(item);}
}
