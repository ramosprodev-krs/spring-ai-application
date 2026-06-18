package ramosprodev.spring_ai_application.controller;

import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.web.bind.annotation.*;
import ramosprodev.spring_ai_application.dto.PromptDTO;

@RestController
@RequestMapping("/api")
public class ChatModelController {

    private final GoogleGenAiChatModel chatModel;

    public ChatModelController(GoogleGenAiChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @PostMapping("/chat")
    public String chat(@RequestBody PromptDTO prompt) {
        return chatModel.call(prompt.getPrompt());
    }
}
