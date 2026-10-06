package io.engineeringdecoded.progress;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import java.util.concurrent.Semaphore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/api/dsa/java")
public class JavaRunnerController {
  private final RestClient client;
  private final String token;
  private final Semaphore slots = new Semaphore(2);
  public JavaRunnerController(@Value("${app.java-runner.url:}") String url, @Value("${app.java-runner.token:}") String token) {
    this.token=token;
    var factory=new SimpleClientHttpRequestFactory(); factory.setConnectTimeout(3000); factory.setReadTimeout(65000);
    client=url.isBlank() || token.isBlank() ? null : RestClient.builder().baseUrl(url).requestFactory(factory).build();
  }
  public record JavaCase(@NotBlank @Size(max=100) String label,@NotNull @Size(max=4096) String input,@NotNull @Size(max=4096) String expected) {}
  public record Run(@NotBlank @Size(max=20000) String code,@NotNull @Size(min=1,max=4) List<@Valid JavaCase> tests) {}
  @GetMapping("/status") public Map<String,Object> status() {
    if(client==null) return Map.of("available",false,"message","Java execution is not configured on this server. Editing and local execution remain available.");
    try { client.get().uri("/health").header("Authorization","Bearer "+token).retrieve().toBodilessEntity(); return Map.of("available",true,"message","Java 21 runner is ready."); }
    catch(Exception e) {return Map.of("available",false,"message","The isolated Java runner is offline. Please retry later.");}
  }
  @PostMapping("/run") public ResponseEntity<String> run(@Valid @RequestBody Run request) {
    if(client==null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Java execution is not configured");
    if(!slots.tryAcquire()) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Java runner is busy; retry shortly");
    try {
      String body=client.post().uri("/run").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).body(request).retrieve().body(String.class);
      return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body);
    } catch(Exception e) {throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Java runner unavailable or timed out; your code remains saved");}
    finally {slots.release();}
  }
}
