package io.engineeringdecoded.admin;
import io.engineeringdecoded.user.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
@Component
public class AdminBootstrap implements CommandLineRunner {
  private final UserRepository users; private final PasswordEncoder passwords; private final String email; private final String password;
  public AdminBootstrap(UserRepository users,PasswordEncoder passwords,@Value("${app.admin.email}") String email,@Value("${app.admin.password}") String password){this.users=users;this.passwords=passwords;this.email=email;this.password=password;}
  public void run(String... args){if(email.isBlank()||password.isBlank()||users.existsByEmailIgnoreCase(email))return;var admin=new User();admin.setDisplayName("Administrator");admin.setEmail(email.trim().toLowerCase());admin.setPasswordHash(passwords.encode(password));admin.setRole(Role.ADMIN);users.save(admin);}
}
