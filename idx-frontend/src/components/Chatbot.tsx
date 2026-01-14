import { useState, useRef, useEffect } from 'react';
import { chatbotService } from '../services/api';
import type { ChatMessage, ChatRequest } from '../services/api';

interface ChatbotProps {
    propertyContext?: number[]; // Optional property IDs for context
}

export default function Chatbot({ propertyContext }: ChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: "Hi! I'm your real estate assistant. Ask me anything about properties, neighborhoods, pricing, or the home buying process!",
            timestamp: Date.now()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
        "What properties do you have available?",
        "Tell me about the California real estate market",
        "How do I search for properties with specific features?"
    ]);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chatbot opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: inputValue,
            timestamp: Date.now()
        };

        // Add user message to chat
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Prepare request with conversation history
            const request: ChatRequest = {
                role: 'user',
                content: inputValue,
                timestamp: Date.now(),
                conversationHistory: messages.slice(-6), // Last 3 exchanges
                includePropertyContext: true,
                propertyIds: propertyContext
            };

            // Get AI response
            const response = await chatbotService.sendMessage(request);

            // Add assistant response
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.message,
                timestamp: response.timestamp
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Update suggested questions if available
            if (response.suggestedQuestions && response.suggestedQuestions.length > 0) {
                setSuggestedQuestions(response.suggestedQuestions);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            
            // Add error message
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setInputValue(question);
        inputRef.current?.focus();
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        transition: 'all 0.3s ease',
                        zIndex: 1000,
                        animation: 'pulse 2s ease-in-out infinite'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 30px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
                    }}
                    title="Chat with AI Assistant"
                >
                    💬
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '400px',
                        maxWidth: 'calc(100vw - 4rem)',
                        height: '600px',
                        maxHeight: 'calc(100vh - 4rem)',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        zIndex: 1000,
                        animation: 'slideUp 0.3s ease-out'
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '1.25rem',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderRadius: '16px 16px 0 0'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem'
                                }}
                            >
                                🤖
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>Real Estate Assistant</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                    {isLoading ? 'Typing...' : 'Online'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.5rem',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1.25rem',
                            background: '#f9fafb',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}
                    >
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                    animation: 'fadeIn 0.3s ease-out'
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '80%',
                                        padding: '0.875rem 1.125rem',
                                        borderRadius: message.role === 'user' 
                                            ? '16px 16px 4px 16px' 
                                            : '16px 16px 16px 4px',
                                        background: message.role === 'user'
                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            : 'white',
                                        color: message.role === 'user' ? 'white' : '#374151',
                                        boxShadow: message.role === 'user'
                                            ? '0 2px 8px rgba(102, 126, 234, 0.3)'
                                            : '0 2px 8px rgba(0, 0, 0, 0.08)',
                                        fontSize: '0.9375rem',
                                        lineHeight: '1.5',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div
                                    style={{
                                        padding: '0.875rem 1.125rem',
                                        borderRadius: '16px 16px 16px 4px',
                                        background: 'white',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <span className="typing-dot" style={{ animation: 'typing 1.4s infinite' }}>●</span>
                                    <span className="typing-dot" style={{ animation: 'typing 1.4s infinite 0.2s' }}>●</span>
                                    <span className="typing-dot" style={{ animation: 'typing 1.4s infinite 0.4s' }}>●</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Questions */}
                    {suggestedQuestions.length > 0 && messages.length > 1 && (
                        <div
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'white',
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}
                        >
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
                                Suggested questions:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {suggestedQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestedQuestion(question)}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                                            border: '1px solid rgba(102, 126, 234, 0.3)',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            color: '#667eea',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontWeight: 500
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))';
                                            e.currentTarget.style.borderColor = '#667eea';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))';
                                            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                                        }}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div
                        style={{
                            padding: '1rem 1.25rem',
                            background: 'white',
                            borderTop: '1px solid #e5e7eb',
                            borderRadius: '0 0 16px 16px'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    outline: 'none',
                                    fontSize: '0.9375rem',
                                    transition: 'all 0.2s ease',
                                    background: isLoading ? '#f3f4f6' : 'white'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: (!inputValue.trim() || isLoading)
                                        ? '#e5e7eb'
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: (!inputValue.trim() || isLoading) ? '#9ca3af' : 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '0.9375rem',
                                    cursor: (!inputValue.trim() || isLoading) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: (!inputValue.trim() || isLoading)
                                        ? 'none'
                                        : '0 2px 8px rgba(102, 126, 234, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    if (inputValue.trim() && !isLoading) {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = (!inputValue.trim() || isLoading)
                                        ? 'none'
                                        : '0 2px 8px rgba(102, 126, 234, 0.3)';
                                }}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add animations CSS */}
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                    }
                    50% {
                        box-shadow: 0 4px 30px rgba(102, 126, 234, 0.6);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes typing {
                    0%, 60%, 100% {
                        opacity: 0.3;
                    }
                    30% {
                        opacity: 1;
                    }
                }

                .typing-dot {
                    font-size: 0.75rem;
                    color: #667eea;
                }
            `}</style>
        </>
    );
}
