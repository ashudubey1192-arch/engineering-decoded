package io.engineeringdecoded.user;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "users")
public class User {
  @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
  @Column(name="display_name", nullable=false, length=120) private String displayName;
  @Column(length=320) private String email;
  @Column(length=24) private String mobile;
  @Column(name="password_hash", nullable=false) private String passwordHash;
  @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role = Role.USER;
  @Column(nullable=false) private boolean active = true;
  @Column(name="email_verified", nullable=false) private boolean emailVerified;
  @Column(name="mobile_verified", nullable=false) private boolean mobileVerified;
  @Column(name="google_subject", length=255) private String googleSubject;
  @Column(name="profile_image_url", length=1000) private String profileImageUrl;
  @Column(name="created_at", nullable=false, insertable=false, updatable=false) private Instant createdAt;
  @Column(name="updated_at", nullable=false) private Instant updatedAt = Instant.now();
  @Column(name="last_login_at") private Instant lastLoginAt;
  @PreUpdate void touch() { updatedAt = Instant.now(); }
  public UUID getId(){return id;} public String getDisplayName(){return displayName;} public void setDisplayName(String v){displayName=v;}
  public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getMobile(){return mobile;} public void setMobile(String v){mobile=v;}
  public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;} public Role getRole(){return role;} public void setRole(Role v){role=v;}
  public boolean isActive(){return active;} public void setActive(boolean v){active=v;} public boolean isEmailVerified(){return emailVerified;}
  public boolean isMobileVerified(){return mobileVerified;} public Instant getCreatedAt(){return createdAt;} public Instant getLastLoginAt(){return lastLoginAt;}
  public void setLastLoginAt(Instant v){lastLoginAt=v;}
  public void setEmailVerified(boolean v){emailVerified=v;} public String getGoogleSubject(){return googleSubject;} public void setGoogleSubject(String v){googleSubject=v;}
  public String getProfileImageUrl(){return profileImageUrl;} public void setProfileImageUrl(String v){profileImageUrl=v;}
  public void setMobileVerified(boolean v){mobileVerified=v;}
}
