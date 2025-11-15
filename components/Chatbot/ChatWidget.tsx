"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useChatbot } from '@/hooks/useChatbot';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const { messages, pushChatMessage } = useChatbot();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async () => {
    if (!text.trim()) return;
  await pushChatMessage(text.trim(), 'user');
    setText('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="glass-card w-72 h-80 flex flex-col overflow-hidden shadow-xl">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm font-medium">Assistant</span>
            <button aria-label="Close chat" className="text-xs glass-button-ghost" onClick={() => setOpen(false)}>×</button>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map(m => (
              <div key={m.id} className={cn('text-xs p-2 rounded max-w-[85%]', m.sender === 'user' ? 'ml-auto bg-accent/20 text-accent' : 'bg-white/10')}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-white/10 flex gap-2">
            <input
              aria-label="Message"
              className="glass-input text-xs flex-1"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type a message…"
            />
            <button aria-label="Send" className="glass-button text-xs" onClick={send}>Send</button>
          </div>
        </div>
      )}
      <button aria-label="Toggle chat" className="glass-button rounded-full w-12 h-12 shadow-lg" onClick={() => setOpen(o => !o)}>
        {open ? '–' : '💬'}
      </button>
    </div>
  );
}

export default ChatWidget;
