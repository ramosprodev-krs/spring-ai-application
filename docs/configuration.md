# Configuration

This document describes the key configuration classes and settings in the Spring AI Expense Tracker application.

## Application Configuration

### application.properties

Main configuration file located at `src/main/resources/application.properties`.

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/expense_tracker
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Spring AI Configuration
spring.ai.google.api.key=your_gemini_api_key
spring.ai.google.options.model=gemini-2.0-flash-exp

# JWT Configuration
jwt.secret=your_super_secret_jwt_key_at_least_256_bits_long
jwt.expiration=86400000

# Server Configuration
server.port=8080
```

## Security Configuration

### SecurityConfig

**Location:** `src/main/java/ramosprodev/spring_ai_application/config/SecurityConfig.java`

**Purpose:** Configures Spring Security filters, authorization rules, and CORS.

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**Key Features:**
- CSRF disabled for API endpoints
- Stateless session management (JWT-based)
- Public endpoints for authentication
- JWT filter added before username/password filter
- BCrypt password encryption

## JWT Configuration

### JwtService

**Location:** `src/main/java/ramosprodev/spring_ai_application/service/JwtService.java`

**Purpose:** Generates and validates JWT tokens.

```java
@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private Long jwtExpiration;
    
    public String generateToken(UserDetails userDetails, Long userId) {
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .claim("userId", userId)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
    }
    
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) 
            && !isTokenExpired(token));
    }
    
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

### JwtAuthenticationFilter

**Location:** `src/main/java/ramosprodev/spring_ai_application/config/JwtAuthenticationFilter.java`

**Purpose:** Intercepts requests and validates JWT tokens.

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final UserService userService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt);
        
        if (username != null && 
            SecurityContextHolder.getContext().getAuthentication() == null) {
            
            UserDetails userDetails = userService.loadUserByUsername(username);
            
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, 
                        null, 
                        userDetails.getAuthorities()
                    );
                authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

## AI Configuration

### AudioChatService

**Location:** `src/main/java/ramosprodev/spring_ai_application/service/AudioChatService.java`

**Purpose:** Processes audio commands using Spring AI and Google Gemini.

```java
@Service
public class AudioChatService {
    
    private static final Logger logger = LoggerFactory.getLogger(AudioChatService.class);
    private final ChatClient chatClient;
    
    public AudioChatService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }
    
    public AudioCommandResponseDto processAudioCommand(MultipartFile file) {
        try {
            Resource audioResource = new ByteArrayResource(file.getBytes());
            MimeType mimeType = resolveMimeType(file);
            
            var outputConverter = new BeanOutputConverter<>(AudioCommandResponseDto.class);
            
            String promptText = """
                Você é um assistente financeiro inteligente. Ouça o áudio do usuário.
                
                Primeiro, determine a intenção (campo 'intent'):
                - Use "CREATE" se o usuário estiver relatando um gasto para ser salvo.
                - Use "QUERY" se o usuário estiver fazendo uma pergunta sobre gastos passados.
                - Use "UPDATE" se o usuário estiver solicitando editar um gasto existente.
                
                Segundo, extraia os dados conforme a intenção:
                - Se a intenção for "CREATE", preencha o campo 'expenseData' com valor, descrição, local e comerciante.
                - Se a intenção for "QUERY", deixe o 'expenseData' nulo.
                - Se a intenção for "UPDATE", preencha o campo 'expenseId' com o ID da despesa a ser editada e o campo 'expensePatchData' com os novos valores.
                """ + outputConverter.getFormat();
            
            String aiResponse = chatClient.prompt()
                .user(promptUserSpec -> promptUserSpec
                    .text(promptText)
                    .media(mimeType, audioResource)
                )
                .call()
                .content();
            
            return outputConverter.convert(aiResponse);
            
        } catch (Exception e) {
            logger.error("Falha no processamento multimodal do Gemini", e);
            throw new AudioProcessingException("Erro ao processar áudio: " + e.getMessage(), e);
        }
    }
    
    private MimeType resolveMimeType(MultipartFile file) {
        String contentType = file.getContentType();
        
        if (contentType == null || contentType.equals("application/octet-stream")) {
            return MimeType.valueOf("audio/webm");
        }
        
        if (contentType.contains(";")) {
            contentType = contentType.split(";")[0];
        }
        
        return MimeType.valueOf(contentType);
    }
}
```

## Service Layer Configuration

### UserService

**Location:** `src/main/java/ramosprodev/spring_ai_application/service/UserService.java`

**Purpose:** User management and authentication operations.

```java
@Service
public class UserService implements UserDetailsService {
    
    private static final String USER_NOT_FOUND_MESSAGE = "User not found with id: ";
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    // CRUD operations
    public UserEntity createUser(UserCreateDto UserCreateDto) { /* ... */ }
    public List<UserEntity> findAllUsers() { /* ... */ }
    public UserEntity findUserById(String username) { /* ... */ }
    public UserEntity updateUserByUsername(String username, UserPatchDto userPatchDto) { /* ... */ }
    public void deleteUserById(String username) { /* ... */ }
    
    // UserDetailsService implementation
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }
}
```

### ExpenseService

**Location:** `src/main/java/ramosprodev/spring_ai_application/service/ExpenseService.java`

**Purpose:** Expense management operations with AI tool integration.

```java
@Service
public class ExpenseService {
    
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    
    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }
    
    @Tool(description = "Upon receiving the audio, this tool will create a new expense for the user.")
    public Expense createExpense(ExpenseCreateDto expenseDto, Long userId) { /* ... */ }
    
    @Tool(description = "Upon receiving the audio, this tool will return a list of expenses for the user.")
    public List<Expense> readUserExpenses(Long userId) { /* ... */ }
    
    @Tool(description = "Upon receiving the audio, this tool will update an expense for the user.")
    public Expense updateExpenseById(Long expenseId, Long userId, ExpensePatchDto expensePatchDto) { /* ... */ }
    
    public void deleteExpenseById(Long expenseId) { /* ... */ }
}
```

## Controller Configuration

### AuthController

**Location:** `src/main/java/ramosprodev/spring_ai_application/controller/AuthController.java`

**Purpose:** Handles authentication endpoints.

```java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    private final JwtService jwtService;
    
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserCreateDto UserCreateDto) {
        userService.createUser(UserCreateDto);
        return ResponseEntity.ok("User registered successfully");
    }
    
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UserCreateDto UserCreateDto) {
        // Authentication logic and JWT generation
    }
}
```

### ExpenseController

**Location:** `src/main/java/ramosprodev/spring_ai_application/controller/ExpenseController.java`

**Purpose:** Handles expense operations and AI audio processing.

```java
@RestController
@RequestMapping("/api/v1/expense")
@RequiredArgsConstructor
public class ExpenseController {
    
    private final ExpenseService expenseService;
    private final AudioChatService audioChatService;
    
    @PostMapping("/process")
    public ResponseEntity<?> processAudio(@RequestParam("file") MultipartFile file, 
                                          Authentication authentication) {
        AudioCommandResponseDto command = audioChatService.processAudioCommand(file);
        
        if ("CREATE".equals(command.getIntent())) {
            Long userId = AuthenticationUtil.getUserId(authentication);
            Expense savedExpense = expenseService.createExpense(command.getExpenseData(), userId);
            return ResponseEntity.ok(savedExpense);
            
        } else if ("QUERY".equals(command.getIntent())) {
            Long userId = AuthenticationUtil.getUserId(authentication);
            List<Expense> results = expenseService.readUserExpenses(userId);
            return ResponseEntity.ok(results);
            
        } else if ("UPDATE".equals(command.getIntent())) {
            Long userId = AuthenticationUtil.getUserId(authentication);
            Expense updatedExpense = expenseService.updateExpenseById(
                command.getExpenseId(), userId, command.getExpensePatchData());
            return ResponseEntity.ok(updatedExpense);
        }
        
        return ResponseEntity.badRequest().body("Não foi possível determinar a ação.");
    }
}
```

## Exception Handling

### GlobalExceptionHandler

**Location:** `src/main/java/ramosprodev/spring_ai_application/exception/GlobalExceptionHandler.java`

**Purpose:** Centralized exception handling for consistent error responses.

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    
    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<String> handleUsernameAlreadyExists(UsernameAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
    
    @ExceptionHandler(AudioProcessingException.class)
    public ResponseEntity<String> handleAudioProcessing(AudioProcessingException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }
}
```

## Utility Classes

### AuthenticationUtil

**Location:** `src/main/java/ramosprodev/spring_ai_application/util/AuthenticationUtil.java`

**Purpose:** Extracts user information from authentication context.

```java
public class AuthenticationUtil {
    
    public static Long getUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            throw new IllegalArgumentException("Invalid authentication");
        }
        
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return user.getId();
    }
}
```

## Environment-Specific Configuration

### Profile-Based Configuration

Create separate property files for different environments:

- `application-dev.properties` - Development
- `application-test.properties` - Testing
- `application-prod.properties` - Production

**Example: application-prod.properties**

```properties
spring.datasource.url=jdbc:postgresql://prod-db-server:5432/expense_tracker
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.ai.google.api.key=${GEMINI_API_KEY}
jwt.secret=${JWT_SECRET}
```

## Logging Configuration

### logback-spring.xml

**Location:** `src/main/resources/logback-spring.xml`

```xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <logger name="ramosprodev.spring_ai_application" level="DEBUG"/>
    <logger name="org.springframework.web" level="INFO"/>
    <logger name="org.hibernate" level="ERROR"/>
    
    <root level="INFO">
        <appender-ref ref="STDOUT"/>
    </root>
</configuration>
```

## Testing Configuration

### Test Properties

**Location:** `src/test/resources/application-test.properties`

```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.ai.google.api.key=test_key
jwt.secret=test_secret_key_for_testing_only
```
