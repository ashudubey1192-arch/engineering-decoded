package io.engineeringdecoded.auth;

import io.engineeringdecoded.user.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users; private final LoginAuditRepository audits; private final PasswordEncoder passwords; private final JwtEncoder encoder; private final Duration ttl; private final GoogleIdentityService googleIdentity; private final AuthWorkflowService workflows;
  public AuthController(UserRepository users,LoginAuditRepository audits,PasswordEncoder passwords,JwtEncoder encoder,@Value("${app.jwt.ttl}") Duration ttl,GoogleIdentityService googleIdentity,AuthWorkflowService workflows){this.users=users;this.audits=audits;this.passwords=passwords;this.encoder=encoder;this.ttl=ttl;this.googleIdentity=googleIdentity;this.workflows=workflows;}
  public record RegisterRequest(@NotBlank @Size(max=120) String displayName,@Email String email,@Pattern(regexp="^\\+?[1-9][0-9]{7,14}$") String mobile,@NotBlank @Size(min=8,max=100) String password){}
  public record LoginRequest(@NotBlank String identifier,@NotBlank String password){}
  public record GoogleRequest(@NotBlank String credential){}
  public record RefreshRequest(@NotBlank String refreshToken){}
  public record ForgotPasswordRequest(@NotBlank String identifier){}
  public record ResetPasswordRequest(@NotBlank String token,@NotBlank @Size(min=8,max=100) String password){}
  public record ChangePasswordRequest(@NotBlank String currentPassword,@Size(min=8,max=100) String newPassword){}
  public record ProfileRequest(@NotBlank @Size(max=120) String displayName,@Email String email,@Pattern(regexp="^\\+?[1-9][0-9]{7,14}$") String mobile){}
  public record VerificationRequest(@NotBlank @Pattern(regexp="EMAIL|MOBILE") String channel){}
  public record VerificationConfirm(@NotNull UUID challengeId,@NotBlank @Pattern(regexp="^[0-9]{6}$") String code){}
  public record UserView(UUID id,String displayName,String email,String mobile,String role,boolean active,String profileImageUrl,boolean emailVerified,boolean mobileVerified) { static UserView of(User u){return new UserView(u.getId(),u.getDisplayName(),u.getEmail(),u.getMobile(),u.getRole().name(),u.isActive(),u.getProfileImageUrl(),u.isEmailVerified(),u.isMobileVerified());} }
  public record AuthResponse(String accessToken,String refreshToken,String tokenType,long expiresIn,UserView user){}
  public record MessageResponse(String message,String developmentToken){}

  @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody RegisterRequest request){
    String email=cleanEmail(request.email()); String mobile=cleanMobile(request.mobile());
    if(email==null&&mobile==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Email or mobile is required");
    if(email!=null&&users.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Email is already registered");
    if(mobile!=null&&users.existsByMobile(mobile)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Mobile is already registered");
    var user=new User(); user.setDisplayName(request.displayName().trim()); user.setEmail(email); user.setMobile(mobile); user.setPasswordHash(passwords.encode(request.password())); user=users.save(user); return response(user);
  }
  @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest request,HttpServletRequest servletRequest){
    String identifier=request.identifier().trim(); Optional<User> found=identifier.contains("@")?users.findByEmailIgnoreCase(identifier):users.findByMobile(cleanMobile(identifier));
    User user=found.orElse(null); boolean valid=user!=null&&user.isActive()&&passwords.matches(request.password(),user.getPasswordHash());
    audits.save(new LoginAudit(user==null?null:user.getId(),identifier,valid,servletRequest.getRemoteAddr(),servletRequest.getHeader("User-Agent"),valid?null:"INVALID_CREDENTIALS"));
    if(!valid) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid credentials");
    user.setLastLoginAt(Instant.now()); users.save(user); return response(user);
  }
  @PostMapping("/google") public AuthResponse google(@Valid @RequestBody GoogleRequest request,HttpServletRequest servletRequest){
    var identity=googleIdentity.verify(request.credential());
    if(!identity.emailVerified()||identity.email()==null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Google email is not verified");
    User user=users.findByGoogleSubject(identity.subject()).orElseGet(()->users.findByEmailIgnoreCase(identity.email()).orElseGet(User::new));
    if(user.getId()==null){user.setEmail(identity.email().toLowerCase(Locale.ROOT));user.setPasswordHash(passwords.encode(UUID.randomUUID().toString()));user.setRole(Role.USER);}
    user.setGoogleSubject(identity.subject());user.setEmailVerified(true);user.setDisplayName(identity.name()==null||identity.name().isBlank()?identity.email():identity.name());user.setProfileImageUrl(identity.picture());user.setLastLoginAt(Instant.now());user=users.save(user);
    audits.save(new LoginAudit(user.getId(),identity.email(),true,servletRequest.getRemoteAddr(),servletRequest.getHeader("User-Agent"),null));
    return response(user);
  }
  @GetMapping("/me") public UserView me(@AuthenticationPrincipal Jwt jwt){return users.findById(UUID.fromString(jwt.getSubject())).map(UserView::of).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found"));}
  @PostMapping("/refresh") public AuthResponse refresh(@Valid @RequestBody RefreshRequest request){try{return response(users.findById(workflows.consumeRefresh(request.refreshToken())).filter(User::isActive).orElseThrow());}catch(Exception e){throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid refresh token");}}
  @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT) public void logout(@Valid @RequestBody RefreshRequest request){workflows.revokeRefresh(request.refreshToken());}
  @PostMapping("/forgot-password") public MessageResponse forgot(@Valid @RequestBody ForgotPasswordRequest request){String value=request.identifier().trim();var user=value.contains("@")?users.findByEmailIgnoreCase(value):users.findByMobile(cleanMobile(value));String token=user.map(item->workflows.issuePasswordReset(item.getId())).orElse(null);return new MessageResponse("If the account exists, reset instructions have been issued",token);}
  @PostMapping("/reset-password") public MessageResponse reset(@Valid @RequestBody ResetPasswordRequest request){try{var user=users.findById(workflows.consumePasswordReset(request.token())).orElseThrow();user.setPasswordHash(passwords.encode(request.password()));users.save(user);return new MessageResponse("Password updated",null);}catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid or expired reset token");}}
  @PutMapping("/profile") public UserView profile(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody ProfileRequest request){var user=authenticated(jwt);String email=cleanEmail(request.email());String mobile=cleanMobile(request.mobile());if(email==null&&mobile==null)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Email or mobile is required");if(email!=null&&!email.equalsIgnoreCase(user.getEmail())&&users.existsByEmailIgnoreCase(email))throw new ResponseStatusException(HttpStatus.CONFLICT,"Email is already registered");if(mobile!=null&&!mobile.equals(user.getMobile())&&users.existsByMobile(mobile))throw new ResponseStatusException(HttpStatus.CONFLICT,"Mobile is already registered");if(!Objects.equals(email,user.getEmail()))user.setEmailVerified(false);if(!Objects.equals(mobile,user.getMobile()))user.setMobileVerified(false);user.setDisplayName(request.displayName().trim());user.setEmail(email);user.setMobile(mobile);return UserView.of(users.save(user));}
  @PostMapping("/change-password") public MessageResponse changePassword(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody ChangePasswordRequest request){var user=authenticated(jwt);if(!passwords.matches(request.currentPassword(),user.getPasswordHash()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Current password is incorrect");user.setPasswordHash(passwords.encode(request.newPassword()));users.save(user);return new MessageResponse("Password updated",null);}
  @PostMapping("/verification") public AuthWorkflowService.VerificationIssue verification(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody VerificationRequest request){var user=authenticated(jwt);String destination="EMAIL".equals(request.channel())?user.getEmail():user.getMobile();if(destination==null)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"That contact method is not configured");return workflows.issueVerification(user.getId(),request.channel(),destination);}
  @PostMapping("/verification/confirm") public MessageResponse confirmVerification(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody VerificationConfirm request){var user=authenticated(jwt);try{String channel=workflows.consumeVerification(user.getId(),request.challengeId(),request.code());if("EMAIL".equals(channel))user.setEmailVerified(true);else user.setMobileVerified(true);users.save(user);return new MessageResponse("Contact method verified",null);}catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid or expired verification code");}}
  private AuthResponse response(User user){
    Instant now=Instant.now(); var claims=JwtClaimsSet.builder().issuer("engineering-decoded").issuedAt(now).expiresAt(now.plus(ttl)).subject(user.getId().toString()).claim("roles",List.of("ROLE_"+user.getRole().name())).claim("name",user.getDisplayName()).build();
    String token=encoder.encode(JwtEncoderParameters.from(JwsHeader.with(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256).build(),claims)).getTokenValue();
    var refresh=workflows.issueRefresh(user.getId());
    return new AuthResponse(token,refresh.token(),"Bearer",ttl.toSeconds(),UserView.of(user));
  }
  private User authenticated(Jwt jwt){return users.findById(UUID.fromString(jwt.getSubject())).filter(User::isActive).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Account unavailable"));}
  private static String cleanEmail(String value){return value==null||value.isBlank()?null:value.trim().toLowerCase(Locale.ROOT);}
  private static String cleanMobile(String value){return value==null||value.isBlank()?null:value.replaceAll("[\\s()-]","");}
}
