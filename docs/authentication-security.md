# Authentication & Security

This document explains the authentication and security mechanisms implemented in the Spring AI Expense Tracker application.

## Overview

The application uses **JWT (JSON Web Tokens)** for stateless authentication and authorization. Security is implemented using Spring Security with custom filters for JWT validation.

## Authentication Flow

### 1. User Registration

```
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Process:**
- Validates input using Spring Boot Validation
- Checks if username already exists
- Encrypts password using BCrypt
- Creates new user in database
- Returns success message

### 2. User Login

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Process:**
- Validates credentials
- Loads user details using `UserDetailsService`
- Compares encrypted passwords using BCrypt
- Generates JWT token with 24-hour expiration
- Returns JWT token in response body

### 3. JWT Token Structure

The JWT token contains:

```json
{
  "sub": "john_doe",
  "userId": 1,
  "iat": 1234567890,
  "exp": 1234654290
}
```

- **sub**: Subject (username)
- **userId**: User's database ID
- **iat**: Issued at timestamp
- **exp**: Expiration timestamp

### 4. Protected Resource Access

```
GET /api/v1/expense
Authorization: Bearer <jwt_token>
```

**Process:**
- `JwtAuthenticationFilter` intercepts request
- Extracts JWT token from Authorization header
- Validates token signature and expiration
- Sets authentication in SecurityContext
- Grants access if token is valid

## Security Configuration

### SecurityConfig Class

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

**Key Features:**
- CSRF protection disabled for API
- Public endpoints: `/api/v1/auth/**`, `/h2-console/**`
- All other endpoints require authentication
- JWT filter added before username/password filter

### Password Encryption

Passwords are encrypted using **BCrypt** with default strength (10 rounds):

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

**Benefits:**
- Automatic salt generation
- Built-in strength parameter
- Resistant to rainbow table attacks
- One-way encryption (cannot be decrypted)

## JWT Implementation

### JwtService Class

Handles token generation and validation:

```java
@Service
public class JwtService {
    
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .claim("userId", userId)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
    }
    
    public boolean isTokenValid(String token, UserDetails userDetails) {
        // Validate token signature, expiration, and subject
    }
}
```

### JwtAuthenticationFilter

Intercepts requests and validates JWT tokens:

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) {
        // Extract token from Authorization header
        // Validate token
        // Set authentication in SecurityContext
        // Continue filter chain
    }
}
```

## UserDetailsService Implementation

### UserService Class

Implements Spring Security's `UserDetailsService`:

```java
@Service
public class UserService implements UserDetailsService {
    
    @Override
    public UserDetails loadUserByUsername(String username) {
        UserEntity user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            getAuthorities()
        );
    }
}
```

## Security Best Practices

### Implemented

- ✅ Passwords encrypted with BCrypt
- ✅ JWT tokens with expiration
- ✅ Stateless authentication (no server-side sessions)
- ✅ HTTPS recommended for production
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention via JPA/Hibernate

### Recommended for Production

- 🔒 Enable HTTPS/TLS
- 🔒 Use environment variables for sensitive configuration
- 🔒 Implement rate limiting
- 🔒 Add CORS configuration for frontend
- 🔒 Use a secrets manager for JWT secret
- 🔒 Implement refresh token mechanism
- 🔒 Add logging for security events
- 🔒 Regular security audits

## Common Security Issues

### Token Expiration

JWT tokens expire after 24 hours. Users need to re-login after expiration.

### Token Storage

The frontend stores JWT tokens in memory (recommended). Avoid localStorage for sensitive tokens.

### Password Reset

Currently not implemented. Consider adding password reset functionality with email verification.

## Testing Security

### Test Authentication

```bash
# Test protected endpoint without token (should fail)
curl -X GET http://localhost:8080/api/v1/expense

# Test with invalid token (should fail)
curl -X GET http://localhost:8080/api/v1/expense \
  -H "Authorization: Bearer invalid_token"

# Test with valid token (should succeed)
curl -X GET http://localhost:8080/api/v1/expense \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN"
```

## Security Headers

Consider adding these security headers for production:

```java
http.headers()
    .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
    .httpStrictTransportSecurity(hstsConfig -> hstsConfig
        .includeSubDomains(true)
        .maxAgeInSeconds(31536000));
```

---

#### Now that you've finished reading this file, you can return to the main documentation:  
- [🔙📖 Go back to README](../README.md)
