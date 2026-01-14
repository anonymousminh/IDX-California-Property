package com.idxexchange.idxbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for chat messages between user and AI chatbot
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    
    /**
     * The role of the message sender (user, assistant, system)
     */
    private String role;
    
    /**
     * The actual message content
     */
    private String content;
    
    /**
     * Timestamp of the message
     */
    private Long timestamp;
    
    /**
     * Optional: conversation history for context
     */
    private List<ChatMessage> conversationHistory;
    
    /**
     * Optional: whether to include property context in the response
     */
    private Boolean includePropertyContext;
    
    /**
     * Optional: specific property IDs to include in context
     */
    private List<Long> propertyIds;
}
