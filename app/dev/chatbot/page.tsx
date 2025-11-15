import React from 'react';
import { ChatWidget } from '@/components/Chatbot/ChatWidget';

export default function Page() {
  return (
    <div className="min-h-[60vh] p-6">
      <h1 className="text-2xl font-bold mb-4">Chatbot Demo</h1>
      <p className="text-sm text-muted-foreground mb-6">Use the floating button in the bottom-right to toggle the chatbot.</p>
      <ChatWidget />
    </div>
  );
}
