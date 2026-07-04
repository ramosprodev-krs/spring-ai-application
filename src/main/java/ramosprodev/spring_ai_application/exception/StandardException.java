package ramosprodev.spring_ai_application.exception;

import java.time.LocalDateTime;

public record StandardException(
        LocalDateTime timestamp,
        Integer status,
        String error,
        String message,
        String path) {
}
