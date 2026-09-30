import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../state/AuthContext';

export default function SpotAssist() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Hi ${user?.firstName || 'there'}! I'm SpotAssist. How can I help you with your parking today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/ai/ask', { message: userMsg }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting to the network. Please use the application controls instead." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Don't show if not logged in

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            zIndex: 990
          }}
        >
          <i className="bi bi-robot fs-3"></i>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div 
          className="ps-card border-0 shadow-lg animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '320px',
            height: '420px',
            zIndex: 990,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-robot fs-4"></i>
              <h6 className="mb-0 fw-bold">SpotAssist</h6>
            </div>
            <button className="btn btn-link text-white p-0" onClick={() => setIsOpen(false)}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-3 d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div 
                  className={`p-2 rounded-3 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                  style={{ maxWidth: '85%', fontSize: '0.9rem' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="d-flex justify-content-start mb-3">
                <div className="p-2 rounded-3 shadow-sm bg-white text-muted small">
                  <span className="spinner-grow spinner-grow-sm me-1" role="status" aria-hidden="true"></span>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-top bg-white">
            <form onSubmit={handleSend} className="d-flex gap-2">
              <input 
                type="text" 
                className="form-control form-control-sm border-0 bg-light rounded-pill px-3" 
                placeholder="Ask SpotAssist..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="btn btn-primary btn-sm rounded-circle px-2 shadow-sm" disabled={loading || !input.trim()}>
                <i className="bi bi-send-fill"></i>
              </button>
            </form>
            <div className="text-center mt-2" style={{ fontSize: '0.65rem', color: '#adb5bd' }}>
              SpotAssist AI retrieves real application data.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
