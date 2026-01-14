package com.idxexchange.idxbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for chatbot API
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    
    /**
     * The AI's response message
     */
    private String message;
    
    /**
     * Timestamp of the response
     */
    private Long timestamp;
    
    /**
     * Suggested follow-up questions
     */
    private List<String> suggestedQuestions;
    
    /**
     * Related property IDs if applicable
     */
    private List<Long> relatedPropertyIds;
    
    /**
     * Context information used for generating the response
     */
    private String contextUsed;
}
