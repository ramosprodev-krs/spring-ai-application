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
import ramosprodev.spring_ai_application.dto.AudioCommandResponseDto;
import ramosprodev.spring_ai_application.exception.AudioProcessingException;

@Service
public class AudioChatService {

    private static final Logger logger = LoggerFactory.getLogger(AudioChatService.class);
    private final ChatClient chatClient;

    public AudioChatService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    public AudioCommandResponseDto processAudioCommand(MultipartFile file) {
        try {
            Resource audioResource = new ByteArrayResource(file.getBytes());

            MimeType mimeType = resolveMimeType(file);
            logger.info("Processando áudio com MimeType resolvido: {}", mimeType);

            var outputConverter = new BeanOutputConverter<>(AudioCommandResponseDto.class);

            String promptText = """
                    Você é um assistente financeiro inteligente. Ouça o áudio do usuário.
                    
                    Primeiro, determine a intenção (campo 'intent'):
                    - Use "CREATE" se o usuário estiver relatando um gasto para ser salvo.
                    - Use "QUERY" se o usuário estiver fazendo uma pergunta sobre gastos passados.
                    - Use "UPDATE" se o usuário estiver solicitando editar um gasto existente.
                    
                    Segundo, extraia os dados conforme a intenção:
                    - Se a intenção for "CREATE", preencha o campo 'expenseData' com valor, descrição, local e comerciante.
                    - Se a intenção for "QUERY", deixe o 'expenseData' nulo.
                    - Se a intenção for "UPDATE", preencha o campo 'expenseId' com o ID da despesa a ser editada e o campo 'expensePatchData' com os novos valores (apenas os campos que devem ser alterados).
                    
                    """ + outputConverter.getFormat();

            String aiResponse = chatClient.prompt()
                    .user(promptUserSpec -> promptUserSpec
                            .text(promptText)
                            .media(mimeType, audioResource)
                    )
                    .call()
                    .content();

            logger.info("Resposta bruta do Gemini: \n{}", aiResponse);

            if (aiResponse == null) {
                throw new AudioProcessingException("Nenhuma resposta da IA");
            }

            return outputConverter.convert(aiResponse);

        } catch (Exception e) {
            logger.error("Falha no processamento multimodal do Gemini", e);
            throw new AudioProcessingException("Erro ao processar áudio: " + e.getMessage(), e);
        }
    }

    private MimeType resolveMimeType(MultipartFile file) {
        String contentType = file.getContentType();
        logger.info("Content-Type original enviado pelo frontend: {}", contentType);

        if (contentType == null || contentType.equals("application/octet-stream")) {
            return MimeType.valueOf("audio/webm");
        }

        // Evita erro de parsing caso venha com codecs (ex: audio/webm;codecs=opus)
        if (contentType.contains(";")) {
            contentType = contentType.split(";")[0];
        }

        return MimeType.valueOf(contentType);
    }
}