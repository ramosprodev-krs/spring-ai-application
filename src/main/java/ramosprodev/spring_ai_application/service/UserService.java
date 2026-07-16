package ramosprodev.spring_ai_application.service;

import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ramosprodev.spring_ai_application.dto.UserCreateDto;
import ramosprodev.spring_ai_application.dto.UserPatchDto;
import ramosprodev.spring_ai_application.entity.UserEntity;
import ramosprodev.spring_ai_application.exception.UserNotFoundException;
import ramosprodev.spring_ai_application.exception.UsernameAlreadyExistsException;
import ramosprodev.spring_ai_application.repository.UserRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private static final String USER_NOT_FOUND_MESSAGE = "User not found with id: ";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // CRUD operations are listed below

    // Create user with CreateUserDto
    public UserEntity createUser(UserCreateDto registerDTO) {
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

    // Read user by id
    public UserEntity findUserById(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(USER_NOT_FOUND_MESSAGE + username));
    }

    // Update user by username with UserPatchDto
    public UserEntity updateUserByUsername(String username, UserPatchDto userPatchDto) {
        UserEntity selectedUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(USER_NOT_FOUND_MESSAGE + username));

        if (selectedUser.getUsername().equals(userPatchDto.getUsername())) {
            throw new IllegalArgumentException("Username is the same as the current username");
        }

        if (userRepository.findByUsername(userPatchDto.getUsername()).isPresent()) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }

        selectedUser.setUsername(userPatchDto.getUsername());
        selectedUser.setPassword(passwordEncoder.encode(userPatchDto.getPassword()));

        return userRepository.save(selectedUser);
    }

    public void deleteUserById(String username) {
        UserEntity selectedUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(USER_NOT_FOUND_MESSAGE + username));

        userRepository.delete(selectedUser);
    }

    // Load user by username (required by UserDetailsService)
    public UserDetails loadUserByUsername(@NotNull String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }
}
