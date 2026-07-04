package ramosprodev.spring_ai_application.service;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;
import ramosprodev.spring_ai_application.dto.CreateExpenseDto;
import ramosprodev.spring_ai_application.entity.Expense;
import ramosprodev.spring_ai_application.entity.UserEntity;
import ramosprodev.spring_ai_application.repository.ExpenseRepository;
import ramosprodev.spring_ai_application.repository.UserRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    // CRUD operations are listed below

    // Create expense with CreateExpenseDto
    @Tool(description = "Upon receiving the audio, this tool will create a new expense for the user.")
    public Expense createExpense(CreateExpenseDto expenseDto, Long userId) {
        // Find the user whose expense is being created for
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Set the new expense data
        Expense newExpense = new Expense();
        newExpense.setAmount(expenseDto.getAmount());
        newExpense.setDescription(expenseDto.getDescription());
        newExpense.setLocal(expenseDto.getLocal());
        newExpense.setMerchant(expenseDto.getMerchant());
        newExpense.setCreatedAt(LocalDateTime.now(ZoneId.of("UTC")));
        newExpense.setUser(user);

        // Save the new expense
        return expenseRepository.save(newExpense);
    }

    // Read all expenses from a specific user
    @Tool(description = "Upon receiving the audio, this tool will return a list of expenses for the user.")
    public List<Expense> readUserExpenses(Long userId) {
        return expenseRepository.findByUser_Id(userId);
    }
}
