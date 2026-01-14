package com.idxexchange.idxbackend.service;

import com.idxexchange.idxbackend.dto.ChatMessage;
import com.idxexchange.idxbackend.dto.ChatResponse;
import com.idxexchange.idxbackend.model.Property;
import com.idxexchange.idxbackend.repository.PropertyRepository;
import com.theokanning.openai.completion.chat.ChatCompletionChoice;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for handling AI chatbot functionality
 * Provides context-aware responses about properties
 */
@Service
public class ChatbotService {
    
    @Value("${openai.api.key:}")
    private String openAiApiKey;
    
    @Value("${openai.model:gpt-3.5-turbo}")
    private String modelName;
    
    @Autowired
    private PropertyRepository propertyRepository;
    
    /**
     * Process a chat message and generate an AI response
     */
    public ChatResponse processMessage(ChatMessage message) {
        try {
            // Check if API key is configured
            if (openAiApiKey == null || openAiApiKey.isEmpty()) {
                return createFallbackResponse(message);
            }
            
            // Build context from properties
            String propertyContext = buildPropertyContext(message);
            
            // Build conversation messages
            List<com.theokanning.openai.completion.chat.ChatMessage> messages = new ArrayList<>();
            
            // System message with context
            String systemPrompt = buildSystemPrompt(propertyContext);
            messages.add(new com.theokanning.openai.completion.chat.ChatMessage("system", systemPrompt));
            
            // Add conversation history if present
            if (message.getConversationHistory() != null && !message.getConversationHistory().isEmpty()) {
                for (ChatMessage historyMsg : message.getConversationHistory()) {
                    messages.add(new com.theokanning.openai.completion.chat.ChatMessage(
                        historyMsg.getRole(), 
                        historyMsg.getContent()
                    ));
                }
            }
            
            // Add current user message
            messages.add(new com.theokanning.openai.completion.chat.ChatMessage("user", message.getContent()));
            
            // Create OpenAI service
            OpenAiService service = new OpenAiService(openAiApiKey, Duration.ofSeconds(30));
            
            // Build request
            ChatCompletionRequest completionRequest = ChatCompletionRequest.builder()
                .model(modelName)
                .messages(messages)
                .temperature(0.7)
                .maxTokens(500)
                .build();
            
            // Get response
            List<ChatCompletionChoice> choices = service.createChatCompletion(completionRequest).getChoices();
            
            if (choices == null || choices.isEmpty()) {
                return createFallbackResponse(message);
            }
            
            String responseText = choices.get(0).getMessage().getContent();
            
            // Build response
            return ChatResponse.builder()
                .message(responseText)
                .timestamp(System.currentTimeMillis())
                .suggestedQuestions(generateSuggestedQuestions(message.getContent()))
                .contextUsed(propertyContext.isEmpty() ? "General knowledge" : "Property database context")
                .build();
            
        } catch (Exception e) {
            System.err.println("Error processing chat message: " + e.getMessage());
            e.printStackTrace();
            return createFallbackResponse(message);
        }
    }
    
    /**
     * Build system prompt with property context
     */
    private String buildSystemPrompt(String propertyContext) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a helpful real estate assistant for a California property listing website. ");
        prompt.append("You help users find properties, answer questions about real estate, and provide guidance on the home buying process. ");
        prompt.append("Be friendly, professional, and concise. ");
        
        if (!propertyContext.isEmpty()) {
            prompt.append("\n\nHere is the current property database context:\n");
            prompt.append(propertyContext);
            prompt.append("\n\nUse this information to provide accurate, data-driven responses.");
        }
        
        prompt.append("\n\nIf asked about specific properties, features, or locations, reference the data available. ");
        prompt.append("If you don't have specific information, be honest and suggest using the search functionality.");
        
        return prompt.toString();
    }
    
    /**
     * Build property context for AI
     */
    private String buildPropertyContext(ChatMessage message) {
        StringBuilder context = new StringBuilder();
        
        try {
            // If specific property IDs are requested
            if (message.getPropertyIds() != null && !message.getPropertyIds().isEmpty()) {
                List<Property> properties = propertyRepository.findAllById(message.getPropertyIds());
                if (!properties.isEmpty()) {
                    context.append("Specific properties:\n");
                    for (Property property : properties) {
                        context.append(formatPropertyForContext(property)).append("\n");
                    }
                }
            } 
            // Otherwise, provide general database statistics
            else if (message.getIncludePropertyContext() == null || message.getIncludePropertyContext()) {
                long totalProperties = propertyRepository.count();
                context.append("Database Statistics:\n");
                context.append("- Total properties available: ").append(totalProperties).append("\n");
                
                // Get sample of recent properties
                List<Property> sampleProperties = propertyRepository.findAll(PageRequest.of(0, 5)).getContent();
                if (!sampleProperties.isEmpty()) {
                    context.append("- Recent property samples:\n");
                    for (Property property : sampleProperties) {
                        context.append("  * ").append(property.getCity()).append(", ");
                        context.append(property.getBeds()).append(" beds, ");
                        context.append(property.getBaths()).append(" baths");
                        if (property.getPrice() != null) {
                            context.append(", $").append(String.format("%,.0f", property.getPrice()));
                        }
                        context.append("\n");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error building property context: " + e.getMessage());
        }
        
        return context.toString();
    }
    
    /**
     * Format a single property for context
     */
    private String formatPropertyForContext(Property property) {
        StringBuilder sb = new StringBuilder();
        sb.append("Property ID ").append(property.getId()).append(": ");
        
        if (property.getAddress() != null) {
            sb.append(property.getAddress()).append(", ");
        }
        
        sb.append(property.getCity()).append(", ").append(property.getState()).append(" ");
        sb.append(property.getZip()).append(" | ");
        sb.append(property.getBeds()).append(" beds, ");
        sb.append(property.getBaths()).append(" baths");
        
        if (property.getSquareFeet() != null) {
            sb.append(", ").append(property.getSquareFeet()).append(" sqft");
        }
        
        if (property.getPrice() != null) {
            sb.append(" | $").append(String.format("%,.0f", property.getPrice()));
        }
        
        // Add features
        List<String> features = new ArrayList<>();
        if (property.getPoolPrivate() != null && property.getPoolPrivate()) features.add("pool");
        if (property.getFireplace() != null && property.getFireplace()) features.add("fireplace");
        if (property.getView() != null && property.getView()) features.add("view");
        if (property.getGarage() != null && property.getGarage()) features.add("garage");
        
        if (!features.isEmpty()) {
            sb.append(" | Features: ").append(String.join(", ", features));
        }
        
        return sb.toString();
    }
    
    /**
     * Generate suggested follow-up questions
     */
    private List<String> generateSuggestedQuestions(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.contains("price") || lowerMessage.contains("cost") || lowerMessage.contains("afford")) {
            return Arrays.asList(
                "What's the average price in different cities?",
                "Show me properties under $500k",
                "What factors affect property prices?"
            );
        } else if (lowerMessage.contains("bedroom") || lowerMessage.contains("bed")) {
            return Arrays.asList(
                "What's the difference between 2 and 3 bedroom homes?",
                "Show me homes with 4+ bedrooms",
                "Are larger homes more expensive?"
            );
        } else if (lowerMessage.contains("location") || lowerMessage.contains("city") || lowerMessage.contains("neighborhood")) {
            return Arrays.asList(
                "Which cities have the most properties?",
                "What are the best neighborhoods for families?",
                "Compare Los Angeles vs San Francisco properties"
            );
        } else if (lowerMessage.contains("feature") || lowerMessage.contains("pool") || lowerMessage.contains("garage")) {
            return Arrays.asList(
                "Show me homes with pools",
                "What features are most common?",
                "Do certain features increase property value?"
            );
        } else {
            return Arrays.asList(
                "What types of properties are available?",
                "How do I search for specific features?",
                "Tell me about the California real estate market"
            );
        }
    }
    
    /**
     * Create a fallback response when AI service is unavailable
     */
    private ChatResponse createFallbackResponse(ChatMessage message) {
        String fallbackMessage;
        
        if (openAiApiKey == null || openAiApiKey.isEmpty()) {
            fallbackMessage = "I'm currently in demo mode. To enable full AI capabilities, please configure your OpenAI API key. " +
                            "You can still use the smart search feature to find properties!";
        } else {
            fallbackMessage = "I'm having trouble processing your request right now. " +
                            "Please try using the search bar above to find properties, or try again in a moment.";
        }
        
        return ChatResponse.builder()
            .message(fallbackMessage)
            .timestamp(System.currentTimeMillis())
            .suggestedQuestions(Arrays.asList(
                "How do I search for properties?",
                "What filters are available?",
                "Show me example searches"
            ))
            .contextUsed("Fallback mode")
            .build();
    }
}
