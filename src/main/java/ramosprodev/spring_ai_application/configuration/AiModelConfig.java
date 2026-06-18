package ramosprodev.spring_ai_application.configuration;

import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiModelConfig {

    @Bean
    public GoogleGenAiChatOptions googleGenAiChatOptions (){
        return GoogleGenAiChatOptions.builder()
                .model("gemini-3.5-flash")
                .build();


    }
}
