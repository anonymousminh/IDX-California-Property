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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            
            // Extract lead qualification data if enough conversation history
            if (message.getConversationHistory() != null && message.getConversationHistory().size() >= 2) {
                extractLeadData(message.getConversationHistory(), message.getContent());
            }
            
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
     * Build system prompt with property context - Lead Qualification Focus
     */
    private String buildSystemPrompt(String propertyContext) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are a friendly and helpful real estate lead qualification assistant for a California property listing website. ");
        prompt.append("Your primary goal is to understand the buyer's needs through natural conversation and qualify them as leads. ");
        prompt.append("\n\nYour responsibilities:\n");
        prompt.append("1. Ask thoughtful questions to understand their needs (budget, location, home features, timeline)\n");
        prompt.append("2. Gather key qualification information naturally through conversation\n");
        prompt.append("3. Make personalized property recommendations based on their answers\n");
        prompt.append("4. Be conversational - don't interrogate, have a friendly dialogue\n");
        prompt.append("5. After understanding their needs, guide them to search for properties or contact an agent\n");
        
        prompt.append("\n\nKey qualification questions to explore (ask naturally, not all at once):\n");
        prompt.append("- Price range/budget (most important)\n");
        prompt.append("- Preferred cities or neighborhoods in California\n");
        prompt.append("- Number of bedrooms and bathrooms needed\n");
        prompt.append("- Must-have features (pool, garage, view, etc.)\n");
        prompt.append("- Timeline for purchase (urgent, 3-6 months, just looking, etc.)\n");
        prompt.append("- Current situation (first-time buyer, upgrading, relocating, etc.)\n");
        
        if (!propertyContext.isEmpty()) {
            prompt.append("\n\nCurrent property database context:\n");
            prompt.append(propertyContext);
            prompt.append("\n\nUse this data to provide accurate recommendations and insights.");
        }
        
        prompt.append("\n\nConversation style:\n");
        prompt.append("- Start with a warm greeting and ONE key question (usually about what they're looking for)\n");
        prompt.append("- Ask follow-up questions based on their responses\n");
        prompt.append("- Show enthusiasm when they share information\n");
        prompt.append("- If they've shared enough info, suggest using the search feature or connecting with an agent\n");
        prompt.append("- Always be helpful, never pushy\n");
        
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
     * Generate suggested follow-up questions - Lead Qualification Focus
     */
    private List<String> generateSuggestedQuestions(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();
        
        // If discussing budget/price
        if (lowerMessage.contains("budget") || lowerMessage.contains("price") || 
            lowerMessage.contains("afford") || lowerMessage.contains("$") || 
            lowerMessage.contains("k") || lowerMessage.contains("cost")) {
            return Arrays.asList(
                "What cities or neighborhoods interest you?",
                "How many bedrooms do you need?",
                "When are you planning to buy?"
            );
        } 
        // If discussing location
        else if (lowerMessage.contains("location") || lowerMessage.contains("city") || 
                 lowerMessage.contains("neighborhood") || lowerMessage.contains("area") ||
                 lowerMessage.contains("los angeles") || lowerMessage.contains("san francisco") ||
                 lowerMessage.contains("san diego") || lowerMessage.contains("sacramento")) {
            return Arrays.asList(
                "What's your budget range?",
                "How many bedrooms and bathrooms do you need?",
                "Any must-have features?"
            );
        }
        // If discussing bedrooms/bathrooms
        else if (lowerMessage.contains("bedroom") || lowerMessage.contains("bed") || 
                 lowerMessage.contains("bath")) {
            return Arrays.asList(
                "What's your price range?",
                "Which areas are you considering?",
                "What features are important to you?"
            );
        }
        // If discussing features
        else if (lowerMessage.contains("pool") || lowerMessage.contains("garage") || 
                 lowerMessage.contains("view") || lowerMessage.contains("yard") ||
                 lowerMessage.contains("feature") || lowerMessage.contains("fireplace")) {
            return Arrays.asList(
                "What's your budget for a home with these features?",
                "Which neighborhoods are you interested in?",
                "When are you looking to move?"
            );
        }
        // If discussing timeline
        else if (lowerMessage.contains("timeline") || lowerMessage.contains("when") || 
                 lowerMessage.contains("soon") || lowerMessage.contains("month") ||
                 lowerMessage.contains("year")) {
            return Arrays.asList(
                "Are you pre-approved for a mortgage?",
                "Have you been actively looking at properties?",
                "Would you like to see properties in your price range?"
            );
        }
        // First interaction or general inquiry
        else {
            return Arrays.asList(
                "What's your budget range?",
                "Which California cities interest you most?",
                "How many bedrooms do you need?",
                "When are you planning to buy?"
            );
        }
    }
    
    /**
     * Extract lead qualification data from conversation
     * This logs lead information for follow-up (can be saved to database in production)
     */
    private void extractLeadData(List<ChatMessage> conversationHistory, String currentMessage) {
        Map<String, String> leadData = new HashMap<>();
        
        // Combine all user messages
        StringBuilder userMessages = new StringBuilder();
        for (ChatMessage msg : conversationHistory) {
            if ("user".equals(msg.getRole())) {
                userMessages.append(msg.getContent()).append(" ");
            }
        }
        userMessages.append(currentMessage).append(" ");
        String conversation = userMessages.toString().toLowerCase();
        
        // Extract budget mentions
        if (conversation.matches(".*\\$?\\d{3,}k.*") || conversation.matches(".*\\$\\d{6,}.*")) {
            leadData.put("budget_mentioned", "yes");
            // Try to extract specific numbers
            if (conversation.contains("500k") || conversation.contains("$500")) {
                leadData.put("budget_range", "~500k");
            } else if (conversation.contains("1m") || conversation.contains("million")) {
                leadData.put("budget_range", "1M+");
            } else if (conversation.contains("300k") || conversation.contains("$300")) {
                leadData.put("budget_range", "~300k");
            }
        }
        
        // Extract location mentions
        List<String> cities = Arrays.asList("los angeles", "san francisco", "san diego", 
                                            "sacramento", "san jose", "oakland", "fresno", 
                                            "long beach", "bakersfield", "anaheim");
        for (String city : cities) {
            if (conversation.contains(city)) {
                leadData.put("preferred_city", city);
                break;
            }
        }
        
        // Extract bedroom count
        if (conversation.matches(".*(\\d+)\\s*(bed|bedroom).*")) {
            leadData.put("bedrooms_mentioned", "yes");
            if (conversation.contains("3 bed") || conversation.contains("3-bed")) {
                leadData.put("bedrooms", "3");
            } else if (conversation.contains("4 bed") || conversation.contains("4-bed")) {
                leadData.put("bedrooms", "4");
            } else if (conversation.contains("2 bed") || conversation.contains("2-bed")) {
                leadData.put("bedrooms", "2");
            }
        }
        
        // Extract feature preferences
        List<String> features = new ArrayList<>();
        if (conversation.contains("pool")) features.add("pool");
        if (conversation.contains("garage")) features.add("garage");
        if (conversation.contains("view")) features.add("view");
        if (conversation.contains("yard") || conversation.contains("backyard")) features.add("yard");
        if (conversation.contains("fireplace")) features.add("fireplace");
        if (!features.isEmpty()) {
            leadData.put("desired_features", String.join(", ", features));
        }
        
        // Extract urgency/timeline
        if (conversation.contains("soon") || conversation.contains("asap") || 
            conversation.contains("urgent") || conversation.contains("immediately")) {
            leadData.put("urgency", "high");
        } else if (conversation.contains("few months") || conversation.contains("3-6 months") ||
                   conversation.contains("this year")) {
            leadData.put("urgency", "medium");
        } else if (conversation.contains("just looking") || conversation.contains("browsing") ||
                   conversation.contains("exploring")) {
            leadData.put("urgency", "low");
        }
        
        // Extract buyer type
        if (conversation.contains("first time") || conversation.contains("first-time")) {
            leadData.put("buyer_type", "first-time");
        } else if (conversation.contains("upgrade") || conversation.contains("upgrading")) {
            leadData.put("buyer_type", "upgrading");
        } else if (conversation.contains("relocat") || conversation.contains("moving")) {
            leadData.put("buyer_type", "relocating");
        } else if (conversation.contains("investment") || conversation.contains("investor")) {
            leadData.put("buyer_type", "investor");
        }
        
        // Log lead data for review (in production, save to database)
        if (!leadData.isEmpty()) {
            System.out.println("=== LEAD QUALIFICATION DATA CAPTURED ===");
            leadData.forEach((key, value) -> 
                System.out.println("  " + key + ": " + value)
            );
            System.out.println("  conversation_length: " + conversationHistory.size() + " exchanges");
            System.out.println("  timestamp: " + System.currentTimeMillis());
            System.out.println("=========================================");
            
            // TODO: In production, save to database or CRM
            // Example: leadRepository.save(new Lead(leadData));
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
