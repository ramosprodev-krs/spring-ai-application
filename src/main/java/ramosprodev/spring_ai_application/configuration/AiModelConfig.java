package ramosprodev.spring_ai_application.configuration;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ramosprodev.spring_ai_application.service.ExpenseService;

@Configuration
public class AiModelConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder, ExpenseService expenseService) {
        // Set the default options for the selected model
        GoogleGenAiChatOptions defaultOptions = GoogleGenAiChatOptions.builder()
                .model("gemini-3.5-flash")
                .build();

        // Return the chat client
        return builder
                .defaultOptions(defaultOptions)
                .defaultTools(expenseService)
                .defaultSystem("You are a helpful assistant.")
                .build();


    }
}
