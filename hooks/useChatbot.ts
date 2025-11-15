import { useYouthForgeStore } from '@/lib/mockStore';

export function useChatbot() {
  const messages = useYouthForgeStore(s => s.chatbotMessages);
  const pushChatMessage = useYouthForgeStore(s => s.pushChatMessage);
  return { messages, pushChatMessage };
}
