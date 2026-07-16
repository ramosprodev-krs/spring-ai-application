package ramosprodev.spring_ai_application.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ramosprodev.spring_ai_application.dto.AudioCommandResponseDto;
import ramosprodev.spring_ai_application.entity.Expense;
import ramosprodev.spring_ai_application.service.AudioChatService;
import ramosprodev.spring_ai_application.service.ExpenseService;
import ramosprodev.spring_ai_application.util.AuthenticationUtil;

import java.util.List;

@RestController
@RequestMapping("/api/v1/expense")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final AudioChatService audioChatService;

    public ExpenseController(ExpenseService expenseService, AudioChatService audioChatService) {
        this.expenseService = expenseService;
        this.audioChatService = audioChatService;
    }

    @PostMapping("/process")
    public ResponseEntity<?> processAudio(@RequestParam("file") MultipartFile file, Authentication authentication) {
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
            Expense updatedExpense = expenseService.updateExpenseById(command.getExpenseId(), userId, command.getExpensePatchData());
            return ResponseEntity.ok(updatedExpense);
        }

        return ResponseEntity.badRequest().body("Não foi possível determinar a ação.");

    }
}
