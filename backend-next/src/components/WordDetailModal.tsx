'use client';

import React, { useEffect, useState } from 'react';
import { X, Volume2, Star, BookOpen, Layers } from 'lucide-react';

export interface Word {
  id: number | string;
  word: string;
  phonetic?: string | null;
  phonetic_uk?: string;
  phonetic_us?: string;
  partOfSpeech?: string | null;
  part_of_speech?: string;
  meaning?: string;
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in">
      <div 
        className="w-full sm:max-w-md bg-[#fffcf5] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up sm:animate-pop border-4 border-[#fcd34d]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - "Cheese" Style */}
        <div className="bg-[#fcd34d] px-6 py-4 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cheese.png')]"></div>
          
          <div className="z-10 flex items-center gap-2">
             <div className="bg-white/90 p-1.5 rounded-xl shadow-sm text-yellow-600">
               <Layers size={18} strokeWidth={3} />
             </div>
             <span className="font-extrabold text-yellow-900 text-sm uppercase tracking-wider bg-white/30 px-3 py-1 rounded-full backdrop-blur-sm">
               {word.level || 'Vocabulary'}
             </span>
          </div>
          
          <div className="z-10 flex items-center gap-3">
            {onToggleFavorite && (
              <button 
                onClick={() => onToggleFavorite(word)} 
                className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm"
              >
                <Star 
                  size={24} 
                  className={word.isFavorite ? "fill-white text-white drop-shadow-sm" : "text-yellow-800/50"} 
                  strokeWidth={3}
                />
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm text-yellow-900"
            >
              <X size={24} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100 mb-6 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300" />
            
            <h2 className="text-4xl font-black text-gray-800 mb-3 tracking-tight">{word.word}</h2>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              {phonetic && (
                <span className="font-mono text-gray-400 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 text-sm">
                  /{phonetic}/
                </span>
              )}
              <button 
                onClick={playSound}
                className={`p-2 rounded-full transition-all active:scale-95 ${isSpeaking ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'}`}
              >
                <Volume2 size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="bg-[#fffbeb] rounded-xl p-4 border border-[#fef3c7]">
               <div className="inline-block px-2 py-0.5 bg-yellow-200 text-yellow-800 text-[10px] font-black rounded-md mb-2 uppercase tracking-wide">
                 {pos}
               </div>
               <p className="text-lg font-bold text-gray-700 leading-snug">
                 {definition}
               </p>
            </div>
          </div>

          {/* Roots Section */}
          {word.roots && (
            <div className="mb-6">
              <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-3 pl-2">Roots & Affixes</h3>
              <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 text-blue-800 font-medium text-sm leading-relaxed relative">
                <div className="absolute -top-2 -left-2 bg-blue-200 text-blue-600 p-1 rounded-lg rotate-12">
                  <BookOpen size={14} />
                </div>
                {word.roots}
              </div>
            </div>
          )}

          {/* Examples Section */}
          {examples.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-3 pl-2">Sentences</h3>
              <div className="space-y-3">
                {examples.map((ex: any, index: number) => (
                  <div key={index} className="bg-white p-4 rounded-2xl border-2 border-gray-50 hover:border-yellow-200 transition-colors shadow-sm group">
                    <p className="text-gray-800 font-bold text-base mb-1.5 leading-snug group-hover:text-yellow-700 transition-colors">
                      {ex.en || ex.sentence}
                    </p>
                    <p className="text-gray-400 text-sm font-medium">
                      {ex.cn || ex.translation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Synonyms & Antonyms */}
          {(synonyms.length > 0 || antonyms.length > 0) && (
            <div className="flex gap-4">
              {synonyms.length > 0 && (
                <div className="flex-1 bg-green-50 p-4 rounded-2xl border-2 border-green-100">
                  <h4 className="text-xs font-black text-green-400 uppercase mb-2">Synonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {synonyms.map(s => (
                      <span key={s} className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-green-700 shadow-sm border border-green-50">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {antonyms.length > 0 && (
                <div className="flex-1 bg-red-50 p-4 rounded-2xl border-2 border-red-100">
                  <h4 className="text-xs font-black text-red-400 uppercase mb-2">Antonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {antonyms.map(a => (
                      <span key={a} className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-red-700 shadow-sm border border-red-50">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center gap-4">
           <button className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200 transition-colors">
             Report Error
           </button>
           <button className="flex-[2] py-3 rounded-xl bg-yellow-400 text-white font-black text-sm shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-none transition-all hover:bg-yellow-300">
             Mark as Mastered
           </button>
        </div>
      </div>
    </div>
  );
}
