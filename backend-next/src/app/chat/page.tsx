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
      // Use the updated Doubao-integrated API
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: messages.concat(userMsg).map(m => ({
            role: m.user._id === 1 ? 'user' : 'assistant',
            content: m.text
          })).slice(-10) // Send context
        })
      });

      const replyText = res.reply || "Sorry, I didn't get that.";

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
      
    } catch (e: any) {
      console.error(e);
      const errorMsg: Message = {
        _id: uuidv4(),
        text: `Error: ${e.message || 'Failed to connect'}`,
        createdAt: new Date(),
        user: { _id: 2 },
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Phone Call Mode Render
  if (showPhoneCall) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-fade-in">
        <div className="absolute top-4 right-4">
          <button onClick={() => setShowPhoneCall(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-20"></div>
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-8 shadow-2xl shadow-pink-500/50 relative z-10">
            <Volume2 size={48} className="text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 tracking-wide">AI Assistant</h2>
        <p className="text-gray-400 mb-12 font-medium">{isListening ? "Listening..." : "Tap mic to speak"}</p>
        
        <div className="flex gap-8 items-center">
          <button 
            onClick={toggleListening}
            className={`p-6 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 shadow-red-500/50 shadow-lg scale-110' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>
          <button 
            onClick={() => setShowPhoneCall(false)}
            className="p-6 rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
          >
            <Phone size={32} className="rotate-[135deg]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
             <span className="text-lg">🤖</span>
           </div>
           <div>
             <h1 className="text-base font-bold text-gray-800">Doubao AI</h1>
             <div className="flex items-center gap-1.5">
               <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
               <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{loading ? 'Thinking' : 'Online'}</span>
             </div>
           </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPhoneCall(true)} className="p-2 hover:bg-pink-50 rounded-full text-pink-500 transition-colors">
            <Phone size={20} />
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.user._id === 1;
          return (
            <div key={msg._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 self-end shadow-sm">
                  <span className="text-sm">🤖</span>
                </div>
              )}
              <div 
                className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-none shadow-pink-200' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none shadow-gray-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start animate-pulse">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 self-end">
               <span className="text-sm">🤖</span>
             </div>
             <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none flex gap-1.5 items-center shadow-sm">
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 mb-20">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-3xl border border-gray-100 shadow-inner">
          <button 
            onClick={toggleListening}
            className={`p-2.5 rounded-full transition-all duration-300 ${
              isListening ? 'bg-red-500 text-white shadow-md animate-pulse' : 'bg-white text-gray-400 hover:text-pink-500 shadow-sm'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : "Type a message..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 outline-none text-gray-700 placeholder:text-gray-400"
            disabled={isListening}
          />
          
          <button 
            onClick={() => handleSend()}
            disabled={!inputText.trim() && !isListening}
            className={`p-2.5 rounded-full transition-all duration-300 ${
              inputText.trim() 
                ? 'bg-blue-500 text-white shadow-md hover:scale-105 active:scale-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden scale-100 animate-zoom-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-lg text-gray-800">Chat Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
               <button 
                 onClick={() => {
                   setMessages([]); 
                   setShowSettings(false);
                 }}
                 className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-colors"
               >
                 <Trash2 size={20} />
                 Clear Chat History
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
