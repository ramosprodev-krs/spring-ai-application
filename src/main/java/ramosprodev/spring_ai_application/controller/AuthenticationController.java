package ramosprodev.spring_ai_application.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import ramosprodev.spring_ai_application.dto.UserLoginDto;
import ramosprodev.spring_ai_application.entity.UserEntity;
import ramosprodev.spring_ai_application.service.TokenService;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthenticationController(AuthenticationManager authenticationManager, TokenService tokenService) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @Valid UserLoginDto loginDto) {
        var authToken = new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword());
        var authentication = this.authenticationManager.authenticate(authToken);
        var user = (UserEntity) authentication.getPrincipal();
        var token = this.tokenService.generateToken(user);
        return ResponseEntity.ok(token);
    }


}
