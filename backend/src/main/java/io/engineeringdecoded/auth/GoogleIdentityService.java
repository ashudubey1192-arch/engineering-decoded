package io.engineeringdecoded.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GoogleIdentityService {
  private final String clientId;
  private final JwtDecoder decoder;
  public record GoogleIdentity(String subject,String email,boolean emailVerified,String name,String picture){}

  public GoogleIdentityService(@Value("${app.google.client-id}") String clientId) {
    this.clientId=clientId;
    var jwtDecoder=NimbusJwtDecoder.withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs").build();
    var issuer=JwtValidators.createDefaultWithIssuer("https://accounts.google.com");
    OAuth2TokenValidator<Jwt> audience=jwt -> jwt.getAudience().contains(clientId)
      ? OAuth2TokenValidatorResult.success()
      : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token","Google token audience does not match",""));
    jwtDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(issuer,audience));
    this.decoder=jwtDecoder;
  }

  public GoogleIdentity verify(String credential) {
    if(clientId==null||clientId.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Google login is not configured");
    try {
      Jwt jwt=decoder.decode(credential); Boolean verified=jwt.getClaim("email_verified");
      return new GoogleIdentity(jwt.getSubject(),jwt.getClaimAsString("email"),Boolean.TRUE.equals(verified),jwt.getClaimAsString("name"),jwt.getClaimAsString("picture"));
    } catch(JwtException exception) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid Google credential"); }
  }
}
