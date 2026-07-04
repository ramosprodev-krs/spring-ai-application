package ramosprodev.spring_ai_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ramosprodev.spring_ai_application.entity.UserEntity;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
}