'use client';

import React, { useEffect, useState } from 'react';
import { X, Volume2, Star } from 'lucide-react';

// Define types locally or import from shared types
export interface Word {
  id: number | string;
  word: string;
  phonetic?: string | null;
  phonetic_uk?: string;
  phonetic_us?: string;
  partOfSpeech?: string | null;
  part_of_speech?: string; // Compatibility
  meaning?: string; // Compatibility
  definition?: string;
  meanings?: { definition: string; language: string }[];
  level?: string;
  examples?: { en: string; cn: string }[] | any;
  synonyms?: string[];
  antonyms?: string[];
  roots?: string;
  isFavorite?: boolean;
}

interface WordDetailModalProps {
  visible: boolean;
  word: Word | null;
  onClose: () => void;
  onToggleFavorite?: (word: Word) => void;
}

export default function WordDetailModal({ visible, word, onClose, onToggleFavorite }: WordDetailModalProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!visible) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [visible]);

  if (!visible || !word) return null;

  const playSound = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Normalization
  const phonetic = word.phonetic || word.phonetic_us || word.phonetic_uk || '';
  const definition = word.meaning || word.definition || word.meanings?.[0]?.definition || '';
  const pos = word.partOfSpeech || word.part_of_speech || 'unknown';
  const examples = Array.isArray(word.examples) ? word.examples : [];
  const synonyms = word.synonyms || [];
  const antonyms = word.antonyms || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up sm:animate-zoom-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="bg-blue-50 px-3 py-1 rounded-md">
            <span className="text-blue-600 font-semibold text-xs">{word.level || 'General'}</span>
          </div>
          <div className="flex items-center gap-4">
            {onToggleFavorite && (
              <button onClick={() => onToggleFavorite(word)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <Star 
                  size={24} 
                  className={word.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"} 
                />
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Word & Phonetic */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-900">{word.word}</h2>
            <button 
              onClick={playSound}
              className={`p-3 rounded-full transition-colors ${isSpeaking ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Volume2 size={24} />
            </button>
          </div>
          
          <div className="flex gap-4 mb-6 text-sm text-gray-500 font-mono">
            {phonetic && <span>/{phonetic}/</span>}
          </div>

          {/* Meaning */}
          <div className="mb-6">
            <div className="text-lg font-bold text-blue-600 italic mb-1">{pos}</div>
            <div className="text-lg text-gray-800 leading-relaxed">{definition}</div>
          </div>

          <div className="h-px bg-gray-100 my-6" />

          {/* Roots */}
          {word.roots && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-2 pl-2 border-l-4 border-pink-400">词根词缀</h3>
              <div className="bg-gray-50 p-4 rounded-xl text-gray-600 text-sm leading-relaxed">
                {word.roots}
              </div>
            </div>
          )}

          {/* Examples */}
          {examples.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-2 pl-2 border-l-4 border-pink-400">例句</h3>
              {examples.map((ex: any, index: number) => (
                <div key={index} className="mb-4 last:mb-0">
                  <p className="text-gray-900 text-base mb-1">{index + 1}. {ex.en || ex.sentence}</p>
                  <p className="text-gray-500 text-sm">{ex.cn || ex.translation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Synonyms & Antonyms */}
          {(synonyms.length > 0 || antonyms.length > 0) && (
            <div className="flex gap-4">
              {synonyms.length > 0 && (
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">同义词</h4>
                  <div className="flex flex-wrap gap-2">
                    {synonyms.map(s => (
                      <span key={s} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {antonyms.length > 0 && (
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">反义词</h4>
                  <div className="flex flex-wrap gap-2">
                    {antonyms.map(a => (
                      <span key={a} className="bg-red-50 px-2 py-1 rounded text-xs text-red-600">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
