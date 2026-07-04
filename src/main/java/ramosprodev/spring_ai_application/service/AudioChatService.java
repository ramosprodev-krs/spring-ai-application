package ramosprodev.spring_ai_application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeType;
import org.springframework.web.multipart.MultipartFile;
import ramosprodev.spring_ai_application.dto.CreateExpenseDto;
import ramosprodev.spring_ai_application.exception.AudioProcessingException;

@Service
public class AudioChatService {

    private static final Logger logger = LoggerFactory.getLogger(AudioChatService.class);

    private final ChatClient chatClient;

    public AudioChatService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    public CreateExpenseDto extractExpenseData(MultipartFile file) {
        try {
            Resource audioResource = new ByteArrayResource(file.getBytes());
            MimeType mimeType = resolveMimeType(file);

            // Instantiate the converter pointing to the DTO
            var outputConverter = new BeanOutputConverter<>(CreateExpenseDto.class);

            // Create the base instruction and concatenate the formatting rules required by Spring AI
            String promptText = "Ouça o áudio com atenção e extraia os dados da despesa (valor, descrição, local e comerciante). "
                    + outputConverter.getFormat();

            // Make the multimodal call to the AI service
            String aiResponse = chatClient.prompt()
                    .user(promptUserSpec -> promptUserSpec
                            .text(promptText)
                            .media(mimeType, audioResource)
                    )
                    .call()
                    .content();

            if (aiResponse == null) {
                logger.warn("AI response was null for expense data extraction");
                throw new AudioProcessingException("No response received from AI service");
            }

            // Convert the string (JSON returned by Gemini) to the Java object
            return outputConverter.convert(aiResponse);

        } catch (Exception e) {
            logger.error("Gemini multimodal processing failure", e);
            throw new AudioProcessingException("Gemini multimodal processing failure: " + e.getMessage(), e);
        }
    }

    public String processExpenseQuery(MultipartFile file) {
        try {
            Resource audioResource = new ByteArrayResource(file.getBytes());
            MimeType mimeType = resolveMimeType(file);

            String promptText = "Listen to the audio and confirm if the user is requesting to query their expenses. "
                    + "Ouça o áudio e confirme se o usuário está solicitando consultar suas despesas. "
                    + "Respond only with 'CONFIRMED' if it is a query request, or 'REJECTED' otherwise. "
                    + "Responda apenas com 'CONFIRMED' se for uma solicitação de consulta, ou 'REJECTED' caso contrário.";

            String aiResponse = chatClient.prompt()
                    .user(promptUserSpec -> promptUserSpec
                            .text(promptText)
                            .media(mimeType, audioResource)
                    )
                    .call()
                    .content();

            if (aiResponse == null) {
                logger.warn("AI response was null for expense query processing");
                throw new AudioProcessingException("No response received from AI service");
            }

            return aiResponse.trim();

        } catch (Exception e) {
            logger.error("Gemini multimodal processing failure", e);
            throw new AudioProcessingException("Gemini multimodal processing failure: " + e.getMessage(), e);
        }
    }

    private MimeType resolveMimeType(MultipartFile file) {
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        if (contentType == null || contentType.equals("application/octet-stream") ||
                (originalFilename != null && originalFilename.contains("WhatsApp"))) {
            contentType = "audio/ogg";
        }
        return MimeType.valueOf(contentType);
    }
}