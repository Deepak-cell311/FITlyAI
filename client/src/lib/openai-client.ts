import { apiRequest } from "./queryClient";

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class OpenAIClient {
  async sendMessage(userId: number, message: string): Promise<ChatMessage> {
    const response = await apiRequest('POST', '/api/chat/message', {
      userId,
      message
    });
    
    const data = await response.json();
    return data.message;
  }

  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    const response = await apiRequest('GET', `/api/chat/messages/${userId}`);
    return await response.json();
  }
}

export const openaiClient = new OpenAIClient();
