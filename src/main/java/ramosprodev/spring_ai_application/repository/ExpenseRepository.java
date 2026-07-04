package ramosprodev.spring_ai_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ramosprodev.spring_ai_application.entity.Expense;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUser_Id(Long userId);
}