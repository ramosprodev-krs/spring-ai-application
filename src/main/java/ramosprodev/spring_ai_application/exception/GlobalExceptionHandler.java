package ramosprodev.spring_ai_application.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.time.ZoneId;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<StandardException> handleBadCredentialsException(BadCredentialsException ex, HttpServletRequest request) {
        logger.error("Authentication failed: {}", ex.getMessage());

        StandardException error = new StandardException(
                Instant.now().atZone(ZoneId.of("UTC")).toLocalDateTime(),
                HttpStatus.UNAUTHORIZED.value(),
                "Authentication Failed",
                "Invalid username or password",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<StandardException> handleUsernameNotFoundException(UsernameNotFoundException ex, HttpServletRequest request) {
        logger.error("User not found: {}", ex.getMessage());

        StandardException error = new StandardException(
                Instant.now().atZone(ZoneId.of("UTC")).toLocalDateTime(),
                HttpStatus.UNAUTHORIZED.value(),
                "User Not Found",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<StandardException> handleUnauthorizedException(UnauthorizedException ex, HttpServletRequest request) {
        logger.error("Unauthorized access: {}", ex.getMessage());

        StandardException error = new StandardException(
                Instant.now().atZone(ZoneId.of("UTC")).toLocalDateTime(),
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<StandardException> handleGenericException(Exception ex, HttpServletRequest request) {

        logger.error("An error occurred: {}", ex.getMessage(), ex);

        String rootCause = (ex.getCause() != null) ? ex.getCause().getMessage() : "No additional details";

        StandardException error = new StandardException(
                Instant.now().atZone(ZoneId.of("UTC")).toLocalDateTime(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                ex.getMessage() + " | Details: " + rootCause,
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
