package io.engineeringdecoded.auth;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="login_audit")
public class LoginAudit {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(name="user_id") private UUID userId;
  @Column(name="login_identifier",nullable=false) private String loginIdentifier;
  @Column(nullable=false) private boolean successful;
  @Column(name="ip_address") private String ipAddress;
  @Column(name="user_agent") private String userAgent;
  @Column(name="failure_reason") private String failureReason;
  @Column(name="occurred_at",insertable=false,updatable=false) private Instant occurredAt;
  protected LoginAudit() {}
  public LoginAudit(UUID userId,String identifier,boolean successful,String ip,String agent,String reason){this.userId=userId;this.loginIdentifier=identifier;this.successful=successful;this.ipAddress=ip;this.userAgent=agent;this.failureReason=reason;}
  public Long getId(){return id;} public UUID getUserId(){return userId;} public String getLoginIdentifier(){return loginIdentifier;} public boolean isSuccessful(){return successful;} public String getIpAddress(){return ipAddress;} public String getFailureReason(){return failureReason;} public Instant getOccurredAt(){return occurredAt;}
}
