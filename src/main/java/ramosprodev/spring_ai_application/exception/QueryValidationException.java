package ramosprodev.spring_ai_application.exception;

public class QueryValidationException extends RuntimeException {

    public QueryValidationException(String message) {
        super(message);
    }

    public QueryValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
