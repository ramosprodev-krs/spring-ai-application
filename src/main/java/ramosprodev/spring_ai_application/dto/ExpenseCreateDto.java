package ramosprodev.spring_ai_application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ExpenseCreateDto {
    private BigDecimal amount;
    private String description;
    private String local;
    private String merchant;
}
