package io.engineeringdecoded.progress;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="learning_progress",uniqueConstraints=@UniqueConstraint(columnNames={"user_id","module_slug","course_slug","article_slug"}))
public class LearningProgress {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(name="user_id",nullable=false) private UUID userId;
  @Column(name="module_slug",nullable=false) private String moduleSlug;
  @Column(name="course_slug",nullable=false) private String courseSlug;
  @Column(name="section_slug",nullable=false) private String sectionSlug;
  @Column(name="article_slug",nullable=false) private String articleSlug;
  @Column(nullable=false) private boolean completed;
  @Column(name="progress_percent",nullable=false) private short progressPercent;
  @Column(name="last_position",nullable=false) private int lastPosition;
  @Column(name="started_at",nullable=false,insertable=false,updatable=false) private Instant startedAt;
  @Column(name="completed_at") private Instant completedAt;
  @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
  public Long getId(){return id;} public UUID getUserId(){return userId;} public void setUserId(UUID v){userId=v;} public String getModuleSlug(){return moduleSlug;} public void setModuleSlug(String v){moduleSlug=v;} public String getCourseSlug(){return courseSlug;} public void setCourseSlug(String v){courseSlug=v;} public String getSectionSlug(){return sectionSlug;} public void setSectionSlug(String v){sectionSlug=v;} public String getArticleSlug(){return articleSlug;} public void setArticleSlug(String v){articleSlug=v;} public boolean isCompleted(){return completed;} public short getProgressPercent(){return progressPercent;} public int getLastPosition(){return lastPosition;} public Instant getStartedAt(){return startedAt;} public Instant getCompletedAt(){return completedAt;} public Instant getUpdatedAt(){return updatedAt;}
  public void update(short percent,int position,boolean done){progressPercent=(short)(done?100:percent);lastPosition=position;completed=done;completedAt=done?(completedAt==null?Instant.now():completedAt):null;updatedAt=Instant.now();}
}
