import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PsychologistAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'I am here to help you reflect on your memories. What is on your mind?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "I'm processing that. It seems connected to your 'Younger Self' memory. How does that make you feel today?"
      }]);
    }, 1000);
  };

  return (
    <div className="hud-element top-right" style={{ pointerEvents: 'auto', width: isOpen ? '300px' : 'auto' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: isOpen ? '10px' : '0' }}>
        {isOpen ? '[-]' : '[+]'} PSYCHOLOGIST AI
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ height: '200px', overflowY: 'auto', marginBottom: '10px', fontSize: '12px', borderTop: '1px solid rgba(0,255,255,0.2)', paddingTop: '10px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: '8px', color: m.role === 'ai' ? '#00ffff' : '#fff' }}>
                  {m.role === 'ai' ? '> ' : 'U: '}{m.text}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  background: 'transparent',
                  border: '1px solid #00ffff',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '5px',
                  flexGrow: 1
                }}
                placeholder="Talk to me..."
              />
              <button onClick={handleSend} style={{ background: '#00ffff', border: 'none', color: '#000', fontSize: '10px', padding: '5px' }}>SEND</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
