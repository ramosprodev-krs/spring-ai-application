package ramosprodev.spring_ai_application.service;

import org.springframework.lang.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ramosprodev.spring_ai_application.dto.CreateUserDto;
import ramosprodev.spring_ai_application.entity.UserEntity;
import ramosprodev.spring_ai_application.repository.UserRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // CRUD operations are listed below

    // Create user with CreateUserDto
    public UserEntity createUser(CreateUserDto registerDTO) {
        UserEntity newUser = new UserEntity();
        newUser.setUsername(registerDTO.getUsername());
        newUser.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        newUser.setCreatedAt(LocalDateTime.now(ZoneId.of("UTC")));

        return userRepository.save(newUser);
    }

    // Read all registered users
    public List<UserEntity> findAllUsers() {
        return userRepository.findAll();
    }

    // Load user by username (required by UserDetailsService)
    public UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }
}
