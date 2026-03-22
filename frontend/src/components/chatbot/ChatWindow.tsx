/**
 * Fenêtre de chat pour le chatbot médical.
 * Design glassmorphique premium cohérent avec le thème de l'application.
 */

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import chatbotService from '../../services/chatbot.service';

export default function ChatWindow() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, isOpen, toggleChat, addMessage, setLoading, setError } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(userMessage);
      addMessage({
        id: response.message_id || Date.now().toString(),
        user: 'current',
        message: userMessage,
        response: response.response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center text-2xl z-50"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          boxShadow: '0 10px 40px -10px rgba(139,92,246,0.6)',
        }}
      >
        💬
      </button>
    );
  }

  return (
    <div 
      className="fixed bottom-6 right-6 w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15,15,35,0.95) 0%, rgba(30,20,50,0.95) 100%)',
        border: '1px solid rgba(139,92,246,0.3)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div 
        className="text-white p-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(236,72,153,0.3) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            }}
          >
            🤖
          </div>
          <div>
            <h3 className="font-semibold text-white">Assistant Médical</h3>
            <p className="text-xs text-white/50">Powered by Armel DAHOUI</p>
          </div>
        </div>
        <button
          onClick={toggleChat}
          className="text-white/60 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,35,0.5) 0%, rgba(30,20,50,0.5) 100%)',
        }}
      >
        {messages.length === 0 && (
          <div className="text-center mt-8">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.2) 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              👋
            </div>
            <p className="text-white/80">Bonjour ! Je suis votre assistant médical.</p>
            <p className="text-sm mt-2 text-white/50">Posez-moi vos questions sur l'AVC.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {/* User message */}
            <div className="flex justify-end">
              <div 
                className="text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[80%]"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                }}
              >
                {msg.message}
              </div>
            </div>
            {/* Bot response */}
            <div className="flex justify-start">
              <div 
                className="text-white/90 px-4 py-3 rounded-2xl rounded-bl-md max-w-[80%]"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {msg.response}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div 
              className="px-4 py-3 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span className="flex gap-1 text-violet-400">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div 
        className="p-4"
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question..."
            className="flex-1 px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 rounded-xl text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
