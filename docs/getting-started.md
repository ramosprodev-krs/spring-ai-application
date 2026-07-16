# Getting Started

This guide will help you set up and run the Spring AI Expense Tracker application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java 21** or higher
- **Maven 3.6+** 
- **PostgreSQL 14+**
- **Google Gemini API Key** (Get one from [Google AI Studio](https://makersuite.google.com/))

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/spring-ai-application.git
cd spring-ai-application
```

### 2. Configure PostgreSQL Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE expense_tracker;
```

### 3. Configure Application Properties

Create or update `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/expense_tracker
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Spring AI Configuration
spring.ai.google.api.key=your_gemini_api_key
spring.ai.google.options.model=gemini-2.0-flash-exp

# JWT Configuration
jwt.secret=your_super_secret_jwt_key_at_least_256_bits_long
jwt.expiration=86400000

# Server Configuration
server.port=8080
```

### 4. Build the Project

```bash
./mvnw clean install
```

### 5. Run the Application

```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

## Frontend Setup

The React frontend is included in `src/main/resources/static/`. It will be served automatically by the Spring Boot application.

### Accessing the Application

1. Open your browser and navigate to `http://localhost:8080`
2. You'll see the login/register page
3. Register a new account or login with existing credentials
4. Start tracking expenses with voice commands!

## Testing the Application

### Test Voice Commands

1. Login to the application
2. Click "Start Recording" in the Audio Command section
3. Speak a command like:
   - "I spent $25 on lunch at McDonald's"
   - "Show me my expenses"
   - "Update expense 1 to $30"
4. Click "Send Audio" to process with AI

### API Testing

You can also test the API endpoints directly:

```bash
# Register a new user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get expenses (replace YOUR_JWT_TOKEN with actual token)
curl -X GET http://localhost:8080/api/v1/expense \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running: `sudo service postgresql status`
2. Check your database credentials in `application.properties`
3. Ensure the database `expense_tracker` exists

### AI API Issues

If the AI features don't work:

1. Verify your Google Gemini API key is valid
2. Check the API key is correctly set in `application.properties`
3. Ensure you have API quota available

### Port Already in Use

If port 8080 is already in use:

1. Change the port in `application.properties`: `server.port=8081`
2. Or stop the process using port 8080

## Development Mode

For development with hot-reload:

```bash
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.devtools.restart.enabled=true"
```

## Production Deployment

For production deployment:

1. Build the JAR file: `./mvnw clean package`
2. Run the JAR: `java -jar target/spring-ai-application-0.0.1-SNAPSHOT.jar`
3. Configure environment variables for sensitive data
4. Use a production-grade PostgreSQL instance
5. Enable HTTPS/TLS for secure communication

---

#### Now that you've finished reading this file, you can return to the main documentation:  
- [🔙📖 Go back to README](../README.md)
