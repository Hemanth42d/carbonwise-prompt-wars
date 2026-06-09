/**
 * AI Sustainability Coach — Natural language conversation interface
 * powered by Gemini for personalized sustainability advice.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../../app/store';
import { getCoachResponse } from '../../services/aiCoach';
import { safeMarkdownToHtml } from '../../shared/utils/security';
import { sanitizeInput } from '../../shared/utils/security';
import { format, parseISO } from 'date-fns';
import './Coach.css';

export const Coach: React.FC = () => {
  const { chatMessages, addChatMessage, isChatLoading, setChatLoading } = useAppStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = useCallback(async (messageText?: string) => {
    const rawText = messageText || input.trim();
    const text = sanitizeInput(rawText);
    if (!text || isChatLoading) return;

    addChatMessage(text, 'user');
    setInput('');
    setChatLoading(true);

    try {
      const response = await getCoachResponse(text);
      addChatMessage(response.content, 'assistant', response.suggestions);
    } catch {
      addChatMessage(
        'Sorry, I encountered an error. Please try again.',
        'assistant'
      );
    } finally {
      setChatLoading(false);
    }
  }, [input, isChatLoading, addChatMessage, setChatLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <section className="coach" aria-labelledby="coach-title">
      <div className="page-header">
        <h1 id="coach-title" className="page-title">AI Sustainability Coach</h1>
        <p className="page-subtitle">
          Powered by Gemini 2.5 Flash — Your personal sustainability advisor.
        </p>
      </div>

      <div className="coach-container glass-card">
        {/* Chat Header */}
        <div className="coach-header">
          <div className="coach-avatar" aria-hidden="true">🤖</div>
          <div className="coach-header-info">
            <span className="coach-name">EcoSphere AI Coach</span>
            <span className="coach-status">
              <span className="status-dot" aria-hidden="true" />
              Powered by Gemini 2.5 Flash
            </span>
          </div>
        </div>

        {/* Messages */}
        <div
          className="coach-messages"
          role="log"
          aria-label="Chat conversation"
          aria-live="polite"
        >
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.role}`}
              role="article"
              aria-label={`${msg.role === 'user' ? 'You' : 'AI Coach'} said`}
            >
              <div className="message-avatar" aria-hidden="true">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">{msg.role === 'user' ? 'You' : 'AI Coach'}</span>
                  <span className="message-time">
                    {format(parseISO(msg.timestamp), 'h:mm a')}
                  </span>
                </div>
                <div
                  className="message-text"
                  dangerouslySetInnerHTML={{
                    __html: safeMarkdownToHtml(msg.content),
                  }}
                />
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="message-suggestions">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        className="suggestion-btn"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="message assistant" role="status" aria-label="AI is typing">
              <div className="message-avatar" aria-hidden="true">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="coach-input-area">
          <input
            ref={inputRef}
            type="text"
            className="coach-input input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about sustainability, your footprint, or get eco-tips..."
            aria-label="Message input"
            disabled={isChatLoading}
          />
          <button
            className="btn btn-primary coach-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isChatLoading}
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      </div>
    </section>
  );
};

/* Markdown rendering is now handled by safeMarkdownToHtml from security utils */
