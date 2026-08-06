package io.engineeringdecoded.auth;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthWorkflowService {
  private final JdbcTemplate jdbc; private final SecureRandom random=new SecureRandom(); private final boolean exposeDevelopmentTokens;
  public record IssuedToken(String token,Instant expiresAt){}
  public record VerificationIssue(UUID challengeId,String developmentCode){}
  public AuthWorkflowService(JdbcTemplate jdbc,@Value("${app.auth.expose-development-tokens}") boolean expose){this.jdbc=jdbc;this.exposeDevelopmentTokens=expose;}
  public IssuedToken issueRefresh(UUID userId){String token=randomToken(48);Instant expiry=Instant.now().plus(Duration.ofDays(30));jdbc.update("insert into user_refresh_tokens(user_id,token_hash,expires_at) values (?,?,?)",userId,hash(token),expiry);return new IssuedToken(token,expiry);}
  @Transactional public UUID consumeRefresh(String token){var rows=jdbc.query("select id,user_id from user_refresh_tokens where token_hash=? and revoked_at is null and expires_at>now() for update",(rs,n)->Map.entry(rs.getObject("id",UUID.class),rs.getObject("user_id",UUID.class)),hash(token));if(rows.isEmpty())throw new IllegalArgumentException("Invalid refresh token");jdbc.update("update user_refresh_tokens set revoked_at=now() where id=?",rows.getFirst().getKey());return rows.getFirst().getValue();}
  public void revokeRefresh(String token){jdbc.update("update user_refresh_tokens set revoked_at=coalesce(revoked_at,now()) where token_hash=?",hash(token));}
  public String issuePasswordReset(UUID userId){jdbc.update("update password_reset_tokens set used_at=now() where user_id=? and used_at is null",userId);String token=randomToken(36);jdbc.update("insert into password_reset_tokens(user_id,token_hash,expires_at) values (?,?,?)",userId,hash(token),Instant.now().plus(Duration.ofMinutes(30)));return exposeDevelopmentTokens?token:null;}
  @Transactional public UUID consumePasswordReset(String token){var ids=jdbc.query("select id,user_id from password_reset_tokens where token_hash=? and used_at is null and expires_at>now() for update",(rs,n)->Map.entry(rs.getObject("id",UUID.class),rs.getObject("user_id",UUID.class)),hash(token));if(ids.isEmpty())throw new IllegalArgumentException("Invalid or expired reset token");jdbc.update("update password_reset_tokens set used_at=now() where id=?",ids.getFirst().getKey());jdbc.update("update user_refresh_tokens set revoked_at=coalesce(revoked_at,now()) where user_id=?",ids.getFirst().getValue());return ids.getFirst().getValue();}
  public VerificationIssue issueVerification(UUID userId,String channel,String destination){jdbc.update("delete from verification_challenges where user_id=? and channel=? and verified_at is null",userId,channel);String code=String.format("%06d",random.nextInt(1_000_000));UUID id=UUID.randomUUID();jdbc.update("insert into verification_challenges(id,user_id,channel,destination,code_hash,expires_at) values (?,?,?,?,?,?)",id,userId,channel,destination,hash(code),Instant.now().plus(Duration.ofMinutes(10)));return new VerificationIssue(id,exposeDevelopmentTokens?code:null);}
  @Transactional public String consumeVerification(UUID userId,UUID challengeId,String code){var channels=jdbc.query("select channel from verification_challenges where id=? and user_id=? and verified_at is null and expires_at>now() and attempts<5 for update",(rs,n)->rs.getString(1),challengeId,userId);if(channels.isEmpty())throw new IllegalArgumentException("Invalid or expired challenge");jdbc.update("update verification_challenges set attempts=attempts+1 where id=?",challengeId);if(jdbc.queryForObject("select code_hash=? from verification_challenges where id=?",Boolean.class,hash(code),challengeId)!=Boolean.TRUE)throw new IllegalArgumentException("Incorrect verification code");jdbc.update("update verification_challenges set verified_at=now() where id=?",challengeId);return channels.getFirst();}
  private String randomToken(int bytes){byte[] value=new byte[bytes];random.nextBytes(value);return Base64.getUrlEncoder().withoutPadding().encodeToString(value);}
  private String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}}
}
