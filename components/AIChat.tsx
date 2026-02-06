import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SendIcon, UserIcon, MicIcon } from './Icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai-chat-messages');
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        // Add welcome message
        const welcomeMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Hello! I\'m your AI assistant, powered by Google Gemini. How can I help you today?',
          timestamp: Date.now()
        };
        setMessages([welcomeMessage]);
      }
    } catch (err) {
      console.error('Failed to load chat history', err);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      setError('Please set your Gemini API key in .env.local file');
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Build conversation history for context
      const history = messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 1000,
        }
      });

      const result = await chat.sendMessage(userMessage.content);
      const response = await result.response;
      const text = response.text();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error calling Gemini API:', err);
      setError(err.message || 'Failed to get response from AI. Please check your API key.');
      
      // Remove the user message if there was an error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      setInput(userMessage.content); // Restore the input
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = () => {
      setError("Voice input failed. Please try again.");
      setTimeout(() => setError(null), 3000);
    };
    recognition.start();
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Chat cleared! How can I help you today?',
      timestamp: Date.now()
    };
    setMessages([welcomeMessage]);
    localStorage.removeItem('ai-chat-messages');
    setShowClearConfirm(false);
  };

  return (
    <div className="animate-fade-in w-full max-w-[1440px] mx-auto h-[calc(100vh-8rem)] flex flex-col p-4 sm:p-6 lg:p-8">
      
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="flex flex-col items-center justify-center mb-6 pb-4 text-center relative z-10">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white via-indigo-50 to-indigo-200 bg-clip-text text-transparent pb-3 drop-shadow-sm leading-tight">
          AI Assistant
        </h1>
        <p className="text-sm text-slate-400 max-w-md">
          Powered by Google Gemini
        </p>
        <div className="h-1.5 w-24 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-full mt-4 shadow-[0_0_20px_rgba(99,102,241,0.6)]"></div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Clear Chat History?</h3>
              <p className="text-slate-400 text-sm mb-6">
                This will permanently delete all messages in this conversation.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearChat}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all font-medium"
                >
                  Clear Chat
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 animate-fade-in ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-indigo-600'
                    : 'bg-gradient-to-br from-violet-600 to-fuchsia-600'
                }`}
              >
                {message.role === 'user' ? (
                  <UserIcon size={20} className="text-white" />
                ) : (
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87-.78-7-4.42-7-8.5V8.3l7-3.11 7 3.11v3.2c0 4.08-3.13 7.72-7 8.5z"/>
                  </svg>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex-1 max-w-[80%] ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block px-5 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-100 border border-slate-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                <div className="mt-1 px-2">
                  <span className="text-[10px] text-slate-500">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-600 to-fuchsia-600">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87-.78-7-4.42-7-8.5V8.3l7-3.11 7 3.11v3.2c0 4.08-3.13 7.72-7 8.5z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="inline-block px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex justify-center animate-fade-in">
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm max-w-md">
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/50">
          <div className="max-w-4xl mx-auto">
            {/* Clear Chat Button */}
            <div className="flex justify-end mb-3">
              <button
                onClick={clearChat}
                className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
              >
                Clear Chat
              </button>
            </div>

            <form onSubmit={sendMessage} className="relative">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-focus-within:opacity-50 blur transition duration-500"></div>
                <div className="relative flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-3 focus-within:border-indigo-500/50">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    rows={1}
                    className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none resize-none text-sm leading-relaxed max-h-[200px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isLoading}
                  />
                  
                  {/* Voice Input Button */}
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="flex-shrink-0 p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                    title="Voice Input"
                    disabled={isLoading}
                  >
                    <MicIcon size={20} />
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white p-2.5 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-indigo-900/40"
                  >
                    <SendIcon size={18} />
                  </button>
                </div>
              </div>
            </form>

            <p className="text-[10px] text-slate-600 text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
