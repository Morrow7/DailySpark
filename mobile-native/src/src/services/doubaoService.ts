import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { chatApi } from './api';

// This service now delegates to the backend via `api.ts` for security and membership checks.
export const DoubaoService = {
  // 1. Chat Completion (LLM)
  chat: async (messages: any[], type: 'text' | 'voice' = 'text') => {
    try {
      // Delegate to backend via chatApi
      const data = await chatApi.sendMessage(messages, type);
      
      // Handle backend response format
      // Doubao backend response usually has choices[0].message.content or result.message
      const content = data?.choices?.[0]?.message?.content || 
                      data?.result?.message || 
                      data?.output?.[0]?.content?.[0]?.text ||
                      data?.output_text ||
                      '';
                      
      return content;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  },

  // 2. Speech to Text (ASR)
  // ... (Keep existing mocking logic for now as requested, or clarify if backend has ASR endpoint)
  // Since the user prompt focuses on the API Key for LLM and Membership, we keep ASR as is for now,
  // but in a real app, this should also go through backend if it uses a paid key.
  transcribeAudio: async (uri: string): Promise<string> => {
    // ... (Keep existing mocking logic)
    // For demo purposes, we will return a mock text.
    console.log('Mocking ASR for:', uri);
    return new Promise(resolve => setTimeout(() => resolve("Hello Doubao, can you tell me a story?"), 1000));
  },
};
