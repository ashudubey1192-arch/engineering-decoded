package io.engineeringdecoded.progress;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface LearningProgressRepository extends JpaRepository<LearningProgress,Long>{
  Optional<LearningProgress> findByUserIdAndModuleSlugAndCourseSlugAndArticleSlug(UUID userId,String module,String course,String article);
  List<LearningProgress> findByUserIdOrderByUpdatedAtDesc(UUID userId);
  long countByUserIdAndCompletedTrue(UUID userId);
  long countByCompletedTrue();
  @Query("select count(distinct concat(p.moduleSlug, concat(':', p.courseSlug))) from LearningProgress p where p.userId=:userId and p.completed=true") long completedCourseCount(@Param("userId") UUID userId);
}
