package com.idxexchange.idxbackend.controller;

import com.idxexchange.idxbackend.dto.ChatMessage;
import com.idxexchange.idxbackend.dto.ChatResponse;
import com.idxexchange.idxbackend.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for AI Chatbot functionality
 * Handles user questions and provides intelligent responses
 */
@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {
    
    @Autowired
    private ChatbotService chatbotService;
    
    /**
     * Process a chat message and return AI response
     * 
     * @param message The user's chat message with optional context
     * @return ChatResponse with AI-generated answer
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatMessage message) {
        try {
            // Set timestamp if not provided
            if (message.getTimestamp() == null) {
                message.setTimestamp(System.currentTimeMillis());
            }
            
            ChatResponse response = chatbotService.processMessage(message);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in chat endpoint: " + e.getMessage());
            e.printStackTrace();
            
            // Return error response
            ChatResponse errorResponse = ChatResponse.builder()
                .message("I'm sorry, I encountered an error processing your request. Please try again.")
                .timestamp(System.currentTimeMillis())
                .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
