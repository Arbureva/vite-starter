import { useChat } from '@/components/chat/useChat';
import { ChatCore } from '@/components/chat/ChatCore';

export function Chat() {
  const chat = useChat();

  return <ChatCore {...chat} variant="page" />;
}
