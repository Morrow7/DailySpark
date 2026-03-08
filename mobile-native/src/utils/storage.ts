import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word } from '../data/mockWords';

const STORAGE_KEY = 'user_words';

export const WordStorage = {
  // Save words to storage
  saveWords: async (words: Word[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    } catch (error) {
      console.error('Failed to save words:', error);
    }
  },

  // Load words from storage
  loadWords: async (): Promise<Word[] | null> => {
    try {
      const storedWords = await AsyncStorage.getItem(STORAGE_KEY);
      return storedWords ? JSON.parse(storedWords) : null;
    } catch (error) {
      console.error('Failed to load words:', error);
      return null;
    }
  },

  // Clear all words
  clearWords: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear words:', error);
    }
  },

  // Add a single word (with deduplication check)
  addWord: async (newWord: Word) => {
    try {
      const currentWords = (await WordStorage.loadWords()) || [];
      // Check if word already exists (case insensitive)
      if (currentWords.some(w => w.word.toLowerCase() === newWord.word.toLowerCase())) {
        return false; // Duplicate
      }
      const updatedWords = [...currentWords, newWord];
      await WordStorage.saveWords(updatedWords);
      return true;
    } catch (error) {
      console.error('Failed to add word:', error);
      return false;
    }
  },

  // Batch add words (efficient for bulk import)
  addWords: async (newWords: Word[]) => {
    try {
      const currentWords = (await WordStorage.loadWords()) || [];
      const currentWordSet = new Set(currentWords.map(w => w.word.toLowerCase()));
      
      const addedWords: Word[] = [];
      const duplicates: string[] = [];

      for (const word of newWords) {
        if (currentWordSet.has(word.word.toLowerCase())) {
          duplicates.push(word.word);
        } else {
          currentWordSet.add(word.word.toLowerCase());
          addedWords.push(word);
        }
      }

      if (addedWords.length > 0) {
        const updatedWords = [...currentWords, ...addedWords];
        await WordStorage.saveWords(updatedWords);
      }

      return { added: addedWords.length, duplicates };
    } catch (error) {
      console.error('Failed to add words:', error);
      throw error;
    }
  },

  // Update a single word (e.g. toggle favorite, mastered, or notes)
  updateWord: async (updatedWord: Word) => {
    try {
      const currentWords = (await WordStorage.loadWords()) || [];
      const index = currentWords.findIndex(w => w.id === updatedWord.id);
      if (index !== -1) {
        currentWords[index] = updatedWord;
        await WordStorage.saveWords(currentWords);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update word:', error);
      return false;
    }
  },
};

const CHAT_STORAGE_KEY = 'chat_history';

export const ChatStorage = {
  saveHistory: async (messages: { role: 'user' | 'assistant'; content: string }[]) => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  },

  loadHistory: async () => {
    try {
      const history = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load chat history:', error);
      return [];
    }
  },

  clearHistory: async () => {
    try {
      await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  },
};
