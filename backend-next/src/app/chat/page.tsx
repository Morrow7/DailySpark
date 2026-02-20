'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/request';
import { Mic, MicOff, Send, Phone, Settings, Volume2, X, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: number;
    name?: string;
    avatar?: string;
  };
  audio?: boolean;
}

// Simple Web Speech API types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPhoneCall, setShowPhoneCall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        _id: '1',
        text: 'Hello! I am Doubao AI. How can I help you practice English today?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Doubao AI',
          avatar: 'https://img.icons8.com/color/48/000000/bot.png',
        },
      },
    ]);

    // Init Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleSend(transcript);
          }
        };

        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e: any) => {
          console.error('Speech error', e);
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Browser does not support Speech Recognition');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: string = inputText) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      _id: uuidv4(),
      text,
      createdAt: new Date(),
      user: { _id: 1 },
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Mock API call or Real API call
      // const res = await apiFetch('/api/chat', { ... });
      
      // Simulate response for now as /api/chat might not be fully configured with keys
      // But let's try to fetch if we can
      let replyText = "I'm a demo bot. I can hear you!";
      
      try {
        const res = await apiFetch('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages: [{ role: 'user', content: text }]
          })
        });
        if (res.reply) {
          replyText = res.reply;
        } else if (res.error) {
           replyText = `Error: ${res.error}`;
        }
      } catch (e) {
        // Fallback mock
        setTimeout(() => {}, 1000);
        replyText = `I heard you say: "${text}". (Backend not connected or failed)`;
      }

      const botMsg: Message = {
        _id: uuidv4(),
        text: replyText,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Doubao AI',
          avatar: 'https://img.icons8.com/color/48/000000/bot.png',
        },
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(replyText);
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Phone Call Mode Render
  if (showPhoneCall) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="absolute top-4 right-4">
          <button onClick={() => setShowPhoneCall(false)} className="p-2 bg-gray-800 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        <div className="w-32 h-32 rounded-full bg-pink-500 flex items-center justify-center mb-8 animate-pulse shadow-[0_0_30px_rgba(236,72,153,0.5)]">
          <Volume2 size={48} className="text-white" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Talking with AI...</h2>
        <p className="text-gray-400 mb-12">Listening...</p>
        
        <div className="flex gap-8">
          <button 
            onClick={toggleListening}
            className={`p-6 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-700'} transition-colors`}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>
          <button 
            onClick={() => setShowPhoneCall(false)}
            className="p-6 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          >
            <Phone size={32} className="rotate-[135deg]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">AI Voice Chat</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPhoneCall(true)} className="p-2 hover:bg-gray-100 rounded-full text-pink-500">
            <Phone size={20} />
          </button>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400' : 'bg-green-500'}`} />
            <span className="text-xs font-medium text-green-700">{loading ? 'Thinking' : 'Online'}</span>
          </div>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.user._id === 1;
          return (
            <div key={msg._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <img src={msg.user.avatar} alt="Bot" className="w-8 h-8 rounded-full mr-2 self-end" />
              )}
              <div 
                className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-pink-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
             <img src="https://img.icons8.com/color/48/000000/bot.png" alt="Bot" className="w-8 h-8 rounded-full mr-2 self-end" />
             <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none flex gap-1">
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-full pr-2">
          <button 
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all ${
              isListening ? 'bg-red-500 text-white shadow-md animate-pulse' : 'bg-white text-gray-500 hover:text-pink-500 shadow-sm'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : "Type a message..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 outline-none"
            disabled={isListening}
          />
          
          <button 
            onClick={() => handleSend()}
            disabled={!inputText.trim() && !isListening}
            className={`p-2 rounded-full transition-colors ${
              inputText.trim() ? 'bg-pink-500 text-white shadow-sm' : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg">Settings</h2>
              <button onClick={() => setShowSettings(false)}>
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="p-4">
               <button 
                 onClick={() => {
                   setMessages([]); 
                   setShowSettings(false);
                 }}
                 className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
               >
                 <Trash2 size={18} />
                 Clear History
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
