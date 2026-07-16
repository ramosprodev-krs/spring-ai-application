package ramosprodev.spring_ai_application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AudioCommandResponseDto {
    private String intent;
    private ExpenseCreateDto expenseData;
    private Long expenseId;
    private ExpensePatchDto expensePatchData;
}
