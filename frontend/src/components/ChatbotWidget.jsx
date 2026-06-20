import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Terminal, HelpCircle } from 'lucide-react';
import chatbotService from '../services/chatbotService';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your TaskFlow AI assistant. 🤖\n\nI can help you manage your tasks. Try typing `help` to see what commands I support!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    setInput('');
    
    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await chatbotService.sendMessage(userMsgText);
      
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.response,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, botMsg]);

      // If the action requires a data refresh, dispatch the global event
      if (data.refresh) {
        window.dispatchEvent(new CustomEvent('tasks-updated'));
      }
    } catch (err) {
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: '⚠️ Sorry, I encountered an error communicating with the server. Please make sure you are logged in and try again.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpCommand = (cmd) => {
    setInput(cmd);
    setShowHelp(false);
  };

  const formatMessageText = (text) => {
    // Simple line break splitting and bolding parsing (e.g. **text**)
    return text.split('\n').map((line, index) => {
      // Parse bold elements **text** and `code` inline elements
      const parts = [];
      let currentLine = line;
      
      // Simple parse for **bold** and `code`
      // We can use a regex to split by tags
      const regex = /(\*\*.*?\*\*|`.*?`|🔹|✅|❌|⏳|⚡|🗑️|📊|📋|📌|💡|⚠️|ℹ️|🎉)/g;
      const splitParts = currentLine.split(regex);
      
      return (
        <p key={index} style={{ marginBottom: line ? '8px' : '4px', lineHeight: '1.5' }}>
          {splitParts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code 
                  key={pIdx} 
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '0.85em',
                    fontFamily: 'monospace',
                    border: '1px solid var(--border-color)',
                    color: 'var(--accent-color)'
                  }}
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, fontFamily: 'var(--font-body)' }}>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(99, 102, 241, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.4)';
          }}
          aria-label="Open Chatbot"
        >
          <Bot size={28} />
          {/* Pulsing indicator badge */}
          <span 
            className="animate-pulse"
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid var(--bg-secondary)'
            }}
          />
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div 
          className="glass animate-fade-in"
          style={{
            width: '380px',
            height: '520px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div 
            style={{
              padding: '16px 20px',
              background: 'var(--gradient-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  padding: '8px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#fff' }}>TaskFlow Bot</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>AI Assistant Online</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => setShowHelp(!showHelp)} 
                title="Help Commands"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                <Terminal size={18} />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Help Reference Panel Overlay */}
          {showHelp && (
            <div 
              style={{
                position: 'absolute',
                top: '72px',
                left: 0,
                right: 0,
                bottom: '66px',
                backgroundColor: 'var(--bg-secondary)',
                zIndex: 10,
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={16} /> Quick Commands
                </h5>
                <button 
                  onClick={() => setShowHelp(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <button 
                  onClick={() => handleHelpCommand('help')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  ℹ️ Show full commands menu
                </button>
                <button 
                  onClick={() => handleHelpCommand('create task: Setup MySQL - Complete DB mapping configuration')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  ➕ Create a new task
                </button>
                <button 
                  onClick={() => handleHelpCommand('list tasks')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  📋 List active tasks
                </button>
                <button 
                  onClick={() => handleHelpCommand('stats')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  📊 Show workspace stats
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 'auto' }}>
                💡 Click any option above to insert it, or type your message in the chat input.
              </p>
            </div>
          )}

          {/* Messages Log */}
          <div 
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'var(--bg-primary)'
            }}
          >
            {messages.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                {msg.sender === 'bot' && (
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--accent-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}
                  >
                    <Bot size={14} />
                  </div>
                )}
                
                <div 
                  style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    backgroundColor: msg.sender === 'user' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '0.88rem',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.sender === 'bot' ? formatMessageText(msg.text) : <p>{msg.text}</p>}
                </div>
              </div>
            ))}

            {/* Skeleton Loader during response */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px' }}>
                <div 
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={14} />
                </div>
                <div 
                  style={{
                    padding: '12px 16px',
                    borderRadius: '18px 18px 18px 2px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={14} className="animate-pulse" style={{ color: 'var(--accent-color)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form 
            onSubmit={handleSend}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask bot to create, list, complete..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: input.trim() && !loading ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                color: input.trim() && !loading ? '#ffffff' : 'var(--text-tertiary)',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
