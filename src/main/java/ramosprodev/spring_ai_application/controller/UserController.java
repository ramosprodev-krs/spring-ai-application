package ramosprodev.spring_ai_application.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ramosprodev.spring_ai_application.dto.UserCreateDto;
import ramosprodev.spring_ai_application.dto.UserPatchDto;
import ramosprodev.spring_ai_application.entity.UserEntity;
import ramosprodev.spring_ai_application.service.UserService;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "http://5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping()
    public ResponseEntity<UserEntity> createUser(@RequestBody UserCreateDto userDto) {
        return ResponseEntity.ok(userService.createUser(userDto));
    }

    @GetMapping("/me")
    public ResponseEntity<UserEntity> readUser(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(userService.findUserById(username));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserEntity> updateUser(Authentication authentication, @RequestBody UserPatchDto userPatchDto){
        String username = authentication.getName();
        return ResponseEntity.ok(userService.updateUserByUsername(username ,userPatchDto));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteUser(Authentication authentication) {
        String username = authentication.getName();
        userService.deleteUserById(username);
        return ResponseEntity.ok().build();
    }
}
