import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, Trash2 } from "lucide-react";
import { apiService } from "../services/api";

/**
 * @typedef {Object} Message
 * @property {string} id - Unique identifier for the message
 * @property {"user" | "assistant"} role - Role of the message sender
 * @property {string} content - Text content of the message
 * @property {"sending" | "error"} [status] - Optional status for assistant messages
 */

/**
 * AIChatPanel component props
 * @typedef {Object} AIChatPanelProps
 * @property {boolean} isOpen - Whether the panel is visible
 * @property {function} onClose - Callback to close the panel
 */

/**
 * A slide-in chat panel for the Gemini AI Assistant.
 * @param {AIChatPanelProps} props 
 */
const AIChatPanel = ({ isOpen, onClose }) => {
  // Initialize from localStorage
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_history");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const panelRef = useRef(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    if (window.confirm("Clear all chat history?")) {
      setMessages([]);
      localStorage.removeItem("chat_history");
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await apiService.sendChatMessage(trimmedInput);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.reply, // Extract the string from the response object
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
        status: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <aside
      ref={panelRef}
      className={`fixed top-0 right-0 h-screen bg-card border-l border-border z-[80] shadow-2xl transition-transform duration-250 ease-out flex flex-col
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        w-full sm:w-[380px]
        motion-reduce:transition-none
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <span className="font-manrope font-bold text-foreground">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-2 hover:bg-red-50 rounded-full transition-colors text-muted-foreground hover:text-red-500"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">AI Assistant</p>
              <p className="text-sm">Ask me anything about your soil or crops.</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm
                  ${msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : msg.status === "error"
                      ? "bg-red-50 text-red-900 border border-red-100 rounded-tl-none"
                      : "bg-muted text-foreground rounded-tl-none"
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-dot-1" />
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-dot-2" />
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-dot-3" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about soil health, crops..."
            disabled={isTyping}
            className="flex-1 bg-muted border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 resize-none max-h-32 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* CSS for typing indicator animation */}
      <style>{`
        @keyframes typing-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-typing-dot-1 { animation: typing-pulse 1s infinite 0ms; }
        .animate-typing-dot-2 { animation: typing-pulse 1s infinite 200ms; }
        .animate-typing-dot-3 { animation: typing-pulse 1s infinite 400ms; }
      `}</style>
    </aside>
  );
};

export default AIChatPanel;
