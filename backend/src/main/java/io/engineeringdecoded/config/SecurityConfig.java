package io.engineeringdecoded.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;

@Configuration @EnableMethodSecurity
public class SecurityConfig {
  @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder(12);}
  @Bean SecretKey jwtKey(@Value("${app.jwt.secret}") String secret){return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),"HmacSHA256");}
  @Bean JwtEncoder jwtEncoder(SecretKey key){return new NimbusJwtEncoder(new ImmutableSecret<>(key));}
  @Bean JwtDecoder jwtDecoder(SecretKey key){return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256).build();}
  @Bean CorsConfigurationSource corsConfigurationSource(@Value("${app.cors-origins}") String origins){
    var config=new CorsConfiguration(); config.setAllowedOrigins(java.util.List.of(origins.split(","))); config.setAllowedMethods(java.util.List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS")); config.setAllowedHeaders(java.util.List.of("Authorization","Content-Type")); config.setAllowCredentials(true);
    var source=new UrlBasedCorsConfigurationSource(); source.registerCorsConfiguration("/**",config); return source;
  }
  @Bean JwtAuthenticationConverter jwtAuthenticationConverter(){
    var authorities=new JwtGrantedAuthoritiesConverter(); authorities.setAuthoritiesClaimName("roles"); authorities.setAuthorityPrefix("");
    var converter=new JwtAuthenticationConverter(); converter.setJwtGrantedAuthoritiesConverter(authorities); return converter;
  }
  @Bean SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http.csrf(csrf->csrf.disable()).cors(Customizer.withDefaults()).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(a->a.requestMatchers("/api/auth/register","/api/auth/login","/api/auth/google","/api/auth/refresh","/api/auth/forgot-password","/api/auth/reset-password","/actuator/health").permitAll().requestMatchers("/api/admin/**").hasRole("ADMIN").anyRequest().authenticated())
      .oauth2ResourceServer(o->o.jwt(jwt->jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))).build();
  }
}
