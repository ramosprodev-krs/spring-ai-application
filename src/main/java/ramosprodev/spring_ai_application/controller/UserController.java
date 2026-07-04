package ramosprodev.spring_ai_application.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ramosprodev.spring_ai_application.dto.CreateUserDto;
import ramosprodev.spring_ai_application.entity.UserEntity;
import ramosprodev.spring_ai_application.service.UserService;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping()
    public ResponseEntity<UserEntity> createUser(@RequestBody CreateUserDto userDto) {
        return ResponseEntity.ok(userService.createUser(userDto));
    }
}
