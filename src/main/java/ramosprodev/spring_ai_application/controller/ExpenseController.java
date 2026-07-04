package ramosprodev.spring_ai_application.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ramosprodev.spring_ai_application.dto.CreateExpenseDto;
import ramosprodev.spring_ai_application.entity.Expense;
import ramosprodev.spring_ai_application.entity.UserEntity;
import ramosprodev.spring_ai_application.service.AudioChatService;
import ramosprodev.spring_ai_application.service.ExpenseService;

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

    @PostMapping(value = "/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Expense> createExpenseViaAudio(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserEntity user = (UserEntity) authentication.getPrincipal();
        CreateExpenseDto extractedDto = audioChatService.extractExpenseData(file);
        Expense savedExpense = expenseService.createExpense(extractedDto, user.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(savedExpense);
    }

    @PostMapping(value = "/query", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<Expense>> readUserExpenses(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserEntity user = (UserEntity) authentication.getPrincipal();
        String queryValidation = audioChatService.processExpenseQuery(file);

        if (!queryValidation.equals("CONFIRMED")) {
            return ResponseEntity.badRequest().build();
        }

        List<Expense> expenses = expenseService.readUserExpenses(user.getId());

        return ResponseEntity.ok(expenses);
    }
}
