# Voice Commands & AI Integration

This document explains how the Spring AI integration works for voice-activated expense tracking.

## Overview

The application leverages **Spring AI** with **Google Gemini** to process voice commands and automatically determine user intent. Users can speak natural language to create, query, or update expenses.

## AI Integration Architecture

### Components

1. **AudioChatService** - Processes audio and communicates with AI
2. **ExpenseService** - Contains @Tool annotated methods for AI function calling
3. **AudioCommandResponseDto** - Structured output from AI processing
4. **ExpenseController** - Routes AI responses to appropriate service methods

## Supported Voice Commands

### 1. CREATE Intent

**Purpose:** Record new expenses via voice

**Example Commands:**
- "I spent $25 on lunch at McDonald's"
- "Paid $50 for groceries at Walmart"
- "Bought gas for $40 at Shell station"

**AI Processing:**
- Extracts amount (e.g., $25)
- Extracts description (e.g., "lunch")
- Extracts location (e.g., "McDonald's")
- Extracts merchant (e.g., "McDonald's")
- Returns `intent: "CREATE"` with `expenseData`

**Response:**
```json
{
  "intent": "CREATE",
  "expenseData": {
    "amount": 25.00,
    "description": "lunch",
    "local": "McDonald's",
    "merchant": "McDonald's"
  }
}
```

### 2. QUERY Intent

**Purpose:** Retrieve expense history

**Example Commands:**
- "Show me my expenses"
- "What did I spend money on?"
- "List all my expenses"

**AI Processing:**
- Recognizes query intent
- Returns `intent: "QUERY"` with null `expenseData`

**Response:**
```json
{
  "intent": "QUERY",
  "expenseData": null
}
```

### 3. UPDATE Intent

**Purpose:** Edit existing expenses

**Example Commands:**
- "Update expense 123 to $30"
- "Change expense 456 description to dinner"
- "Modify expense 789 local to Starbucks"

**AI Processing:**
- Extracts expense ID (e.g., 123)
- Extracts fields to update (amount, description, local, merchant)
- Returns `intent: "UPDATE"` with `expenseId` and `expensePatchData`

**Response:**
```json
{
  "intent": "UPDATE",
  "expenseId": 123,
  "expensePatchData": {
    "amount": 30.00,
    "description": null,
    "local": null,
    "merchant": null
  }
}
```

## Audio Processing Flow

### 1. Audio Recording (Frontend)

```typescript
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  // ... recording logic
};
```

**Supported Formats:**
- audio/webm (default)
- audio/ogg
- audio/mp4

### 2. Audio Upload to Backend

```typescript
const formData = new FormData();
formData.append('file', audioBlob, 'recording.webm');

const response = await fetch('/api/v1/expense/process', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 3. AI Processing (Backend)

```java
public AudioCommandResponseDto processAudioCommand(MultipartFile file) {
    Resource audioResource = new ByteArrayResource(file.getBytes());
    MimeType mimeType = resolveMimeType(file);
    
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
        - Se a intenção for "UPDATE", preencha o campo 'expenseId' com o ID da despesa a ser editada e o campo 'expensePatchData' com os novos valores.
        """ + outputConverter.getFormat();
    
    String aiResponse = chatClient.prompt()
        .user(promptUserSpec -> promptUserSpec
            .text(promptText)
            .media(mimeType, audioResource)
        )
        .call()
        .content();
    
    return outputConverter.convert(aiResponse);
}
```

### 4. Intent Routing

```java
@PostMapping("/process")
public ResponseEntity<?> processAudio(@RequestParam("file") MultipartFile file, 
                                     Authentication authentication) {
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
        Expense updatedExpense = expenseService.updateExpenseById(
            command.getExpenseId(), userId, command.getExpensePatchData());
        return ResponseEntity.ok(updatedExpense);
    }
    
    return ResponseEntity.badRequest().body("Não foi possível determinar a ação.");
}
```

## AI Function Calling

The `@Tool` annotation enables AI to call specific methods:

```java
@Tool(description = "Upon receiving the audio, this tool will create a new expense for the user.")
public Expense createExpense(ExpenseCreateDto expenseDto, Long userId) {
    // Implementation
}

@Tool(description = "Upon receiving the audio, this tool will return a list of expenses for the user.")
public List<Expense> readUserExpenses(Long userId) {
    // Implementation
}

@Tool(description = "Upon receiving the audio, this tool will update an expense for the user.")
public Expense updateExpenseById(Long expenseId, Long userId, ExpensePatchDto expensePatchDto) {
    // Implementation
}
```

## Multimodal Processing

Spring AI supports multimodal inputs (text + audio):

```java
chatClient.prompt()
    .user(promptUserSpec -> promptUserSpec
        .text(promptText)           // Text instructions
        .media(mimeType, audioResource)  // Audio data
    )
    .call()
    .content();
```

## Structured Output

The `BeanOutputConverter` ensures AI responses are structured as Java objects:

```java
var outputConverter = new BeanOutputConverter<>(AudioCommandResponseDto.class);
AudioCommandResponseDto response = outputConverter.convert(aiResponse);
```

**Benefits:**
- Type-safe responses
- Automatic validation
- Easy integration with existing code

## Error Handling

### Audio Processing Errors

```java
try {
    return outputConverter.convert(aiResponse);
} catch (Exception e) {
    logger.error("Falha no processamento multimodal do Gemini", e);
    throw new AudioProcessingException("Erro ao processar áudio: " + e.getMessage(), e);
}
```

### Common Issues

1. **Unsupported Audio Format**
   - Solution: Convert to supported format (webm, ogg, mp4)

2. **AI API Quota Exceeded**
   - Solution: Check Google Cloud Console for quota limits

3. **Unclear Speech**
   - Solution: AI will attempt best effort; consider re-recording

4. **Ambiguous Intent**
   - Solution: AI defaults to most likely intent based on context

## Configuration

### Google Gemini API

```properties
spring.ai.google.api.key=your_gemini_api_key
spring.ai.google.options.model=gemini-2.0-flash-exp
```

### Supported Models

- `gemini-2.0-flash-exp` (default, fast)
- `gemini-2.0-pro-exp` (more accurate, slower)

## Testing Voice Commands

### Manual Testing

1. Login to the application
2. Navigate to the Dashboard tab
3. Click "Start Recording"
4. Speak a command
5. Click "Send Audio"
6. View results in the expenses table

### API Testing

```bash
# Test audio processing
curl -X POST http://localhost:8080/api/v1/expense/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@recording.webm"
```

## Future Enhancements

### Potential Improvements

- 🎯 Support for more languages
- 🎯 Expense category classification
- 🎯 Spending insights and analytics
- 🎯 Voice feedback from AI
- 🎯 Multi-expense batch creation
- 🎯 Natural language date parsing
- 🎯 Currency conversion
- 🎯 Recurring expense recognition

---

#### Now that you've finished reading this file, you can return to the main documentation:  
- [🔙📖 Go back to README](../README.md)
