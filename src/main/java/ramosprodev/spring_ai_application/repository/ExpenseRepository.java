package ramosprodev.spring_ai_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ramosprodev.spring_ai_application.entity.Expense;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUser_Id(Long userId);
    Optional<Expense> findByIdAndUser_Id(Long expenseId, Long userId);
}