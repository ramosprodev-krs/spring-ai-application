package ramosprodev.spring_ai_application.util;

import org.springframework.security.core.Authentication;
import ramosprodev.spring_ai_application.entity.UserEntity;

public class AuthenticationUtil {

    public static UserEntity extractUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalStateException("User not authenticated");
        }
        return (UserEntity) authentication.getPrincipal();
    }

    public static Long getUserId(Authentication authentication) {
        return extractUser(authentication).getId();
    }
}
