# Database Schema

This document describes the database schema and entity relationships for the Spring AI Expense Tracker application.

## Database System

- **Database:** PostgreSQL 14+
- **ORM:** Spring Data JPA (Hibernate)
- **Migration Strategy:** `spring.jpa.hibernate.ddl-auto=update`

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│   UserEntity    │       │     Expense     │
├─────────────────┤       ├─────────────────┤
│ - id (PK)       │◄──────│ - id (PK)       │
│ - username      │  1:N  │ - amount        │
│ - password      │       │ - description   │
│ - createdAt     │       │ - local         │
│                 │       │ - merchant      │
│                 │       │ - createdAt     │
│                 │       │ - user_id (FK)  │
└─────────────────┘       └─────────────────┘
```

## Tables

### users

Stores user account information and authentication credentials.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| username | VARCHAR(255) | NOT NULL, UNIQUE | User's username for login |
| password | VARCHAR(255) | NOT NULL | BCrypt encrypted password |
| created_at | TIMESTAMP | NOT NULL | Account creation timestamp |

**Indexes:**
- `idx_username` on `username` (unique)

**Entity Class:** `UserEntity.java`

```java
@Entity
@Table(name = "users")
public class UserEntity implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "username", nullable = false, unique = true)
    private String username;
    
    @Column(name = "password", nullable = false)
    private String password;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Expense> expenses = new ArrayList<>();
    
    // UserDetails implementation methods...
}
```

### expenses

Stores expense records with transaction details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique expense identifier |
| amount | DECIMAL(19,2) | NOT NULL | Expense amount |
| description | VARCHAR(255) | NOT NULL | Expense description |
| local | VARCHAR(255) | NOT NULL | Location where expense occurred |
| merchant | VARCHAR(255) | NOT NULL | Merchant/vendor name |
| created_at | TIMESTAMP | NOT NULL | Expense creation timestamp |
| user_id | BIGINT | NOT NULL, FOREIGN KEY | Reference to users table |

**Foreign Keys:**
- `fk_expenses_user` on `user_id` → `users.id`

**Indexes:**
- `idx_expenses_user_id` on `user_id`
- `idx_expenses_created_at` on `created_at`

**Entity Class:** `Expense.java`

```java
@Entity
@Table(name = "expenses")
public class Expense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
    
    @Column(name = "description", nullable = false)
    private String description;
    
    @Column(name = "local", nullable = false)
    private String local;
    
    @Column(name = "merchant", nullable = false)
    private String merchant;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private UserEntity user;
}
```

## Relationships

### One-to-Many: User → Expenses

Each user can have multiple expenses, but each expense belongs to exactly one user.

**Cascade Operations:**
- `CascadeType.ALL` - All operations (persist, merge, remove, refresh, detach)
- `orphanRemoval = true` - Delete expenses when removed from user's collection

**Example:**

```java
// Create user with expenses
UserEntity user = new UserEntity();
user.setUsername("john_doe");
user.setPassword(encodedPassword);

Expense expense1 = new Expense();
expense1.setAmount(new BigDecimal("25.00"));
expense1.setDescription("Lunch");
expense1.setUser(user);

Expense expense2 = new Expense();
expense2.setAmount(new BigDecimal("50.00"));
expense2.setDescription("Groceries");
expense2.setUser(user);

user.getExpenses().add(expense1);
user.getExpenses().add(expense2);

userRepository.save(user); // Saves user and both expenses
```

## Repository Interfaces

### UserRepository

```java
@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    
    Optional<UserEntity> findByUsername(String username);
    
    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.expenses WHERE u.id = :id")
    Optional<UserEntity> findByIdWithExpenses(@Param("id") Long id);
}
```

### ExpenseRepository

```java
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByUser_Id(Long userId);
    
    Optional<Expense> findByIdAndUser_Id(Long expenseId, Long userId);
}
```

## Data Transfer Objects (DTOs)

### UserCreateDto

```java
public class UserCreateDto {
    private String username;
    private String password;
}
```

### UserPatchDto

```java
public class UserPatchDto {
    private String username;
    private String password;
}
```

### ExpenseCreateDto

```java
public class ExpenseCreateDto {
    private BigDecimal amount;
    private String description;
    private String local;
    private String merchant;
}
```

### ExpensePatchDto

```java
public class ExpensePatchDto {
    private BigDecimal amount;
    private String description;
    private String local;
    private String merchant;
}
```

## Database Constraints

### User Constraints

- **Username uniqueness:** Ensures no duplicate usernames
- **Password required:** Every user must have a password
- **Created at required:** Timestamp is automatically set

### Expense Constraints

- **Amount required:** Every expense must have an amount
- **Description required:** Every expense must have a description
- **Location required:** Every expense must have a location
- **Merchant required:** Every expense must have a merchant
- **User reference required:** Every expense must belong to a user

## Sample Data

### Sample Users

```sql
INSERT INTO users (username, password, created_at) VALUES
('john_doe', '$2a$10$encryptedPassword1', '2026-07-15 10:00:00'),
('jane_smith', '$2a$10$encryptedPassword2', '2026-07-15 11:00:00');
```

### Sample Expenses

```sql
INSERT INTO expenses (amount, description, local, merchant, created_at, user_id) VALUES
(25.00, 'Lunch', 'McDonalds', 'McDonalds', '2026-07-15 12:00:00', 1),
(50.00, 'Groceries', 'Walmart', 'Walmart', '2026-07-15 13:00:00', 1),
(40.00, 'Gas', 'Shell Station', 'Shell', '2026-07-15 14:00:00', 2);
```

## Performance Considerations

### Indexes

- **Username index:** Fast user lookup during authentication
- **User ID index on expenses:** Efficient expense queries by user
- **Created at index:** Time-based expense queries and sorting

### Query Optimization

```java
// Efficient: Uses indexed user_id
List<Expense> expenses = expenseRepository.findByUser_Id(userId);

// Efficient: Uses indexed username
Optional<UserEntity> user = userRepository.findByUsername(username);

// Efficient: Fetches expenses in single query
Optional<UserEntity> user = userRepository.findByIdWithExpenses(userId);
```

### N+1 Query Problem

Avoid N+1 queries by using JOIN FETCH:

```java
// Bad: N+1 queries
UserEntity user = userRepository.findById(userId).get();
List<Expense> expenses = user.getExpenses(); // Triggers additional queries

// Good: Single query with JOIN FETCH
UserEntity user = userRepository.findByIdWithExpenses(userId).get();
```

## Migration Strategy

Currently using `spring.jpa.hibernate.ddl-auto=update` for automatic schema updates.

**For production, consider:**
- Flyway or Liquibase for version-controlled migrations
- Separate migration scripts for each schema change
- Rollback capabilities for failed migrations

## Backup Strategy

### PostgreSQL Backup

```bash
# Full database backup
pg_dump -U username -d expense_tracker > backup.sql

# Restore from backup
psql -U username -d expense_tracker < backup.sql
```

### Automated Backups

Consider setting up automated backups using:
- pgBackRest
- WAL archiving
- Cloud storage solutions (AWS RDS, Google Cloud SQL)

---

#### Now that you've finished reading this file, you can return to the main documentation:  
- [🔙📖 Go back to README](../README.md)
