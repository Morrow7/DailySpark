'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Volume2, MoreVertical, Plus, FileUp, Filter, CheckCircle, BookOpen } from 'lucide-react';
import WordDetailModal, { Word } from '@/components/WordDetailModal';
import { apiFetch } from '@/lib/request';

// Extend Word type for UI state (mocking progress/status)
interface WordWithStatus extends Word {
  status?: 'new' | 'learning' | 'review' | 'mastered';
  progress?: number; // 0-100
}

export default function WordsPage() {
  const [words, setWords] = useState<WordWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWord, setSelectedWord] = useState<WordWithStatus | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'learning' | 'review' | 'mastered'>('all');

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = () => {
    setLoading(true);
    // Try to load from local storage first for speed
    const cached = localStorage.getItem('vocab_words');
    if (cached) {
      setWords(JSON.parse(cached));
      setLoading(false);
    }

    apiFetch('/api/vocabulary?page=1&limit=50')
      .then(res => {
        // Mocking status/progress for demo
        const enhancedWords = res.words.map((w: Word) => ({
          ...w,
          status: ['new', 'learning', 'review', 'mastered'][Math.floor(Math.random() * 4)],
          progress: Math.floor(Math.random() * 100)
        }));
        setWords(enhancedWords);
        localStorage.setItem('vocab_words', JSON.stringify(enhancedWords));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const filteredWords = useMemo(() => {
    return words.filter(w => {
      const matchesSearch = w.word.toLowerCase().includes(search.toLowerCase()) ||
        w.meaning?.includes(search);
      const matchesFilter = filter === 'all' || w.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [words, search, filter]);

  const playAudio = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-600';
      case 'learning': return 'bg-yellow-100 text-yellow-600';
      case 'review': return 'bg-orange-100 text-orange-600';
      case 'mastered': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'new': return '新词';
      case 'learning': return '学习中';
      case 'review': return '复习';
      case 'mastered': return '已掌握';
      default: return '未知';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 md:pb-12 min-h-screen">
      {/* Header */}
      <div className="pt-8 mb-6 sticky top-0 z-20 bg-[#fffcf5]/90 backdrop-blur-md -mx-4 px-4 border-b border-gray-100/50 pb-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-heading tracking-tight">我的单词本</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              累计词汇 <span className="text-yellow-500 font-bold text-lg">{words.length}</span>
            </p>
          </div>
          <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-yellow-600 transition-colors">
            <FileUp size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索单词..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border-2 border-gray-100 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none font-bold text-gray-700 placeholder-gray-300 shadow-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['all', 'new', 'learning', 'review', 'mastered'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filter === f
                    ? 'bg-yellow-400 text-white border-yellow-400 shadow-md shadow-yellow-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {f === 'all' ? '全部' : getStatusLabel(f)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Word List */}
      <div className="space-y-3 animate-slide-up">
        {loading ? (
          // Skeletons
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 h-24 animate-pulse" />
          ))
        ) : filteredWords.length > 0 ? (
          filteredWords.map((word) => (
            <div
              key={word.id}
              onClick={() => setSelectedWord(word)}
              className="group bg-white p-4 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-50 hover:border-yellow-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Progress Bar (Background) */}
              <div
                className="absolute bottom-0 left-0 h-1 bg-yellow-400 opacity-20 transition-all duration-500"
                style={{ width: `${word.progress}%` }}
              />

              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-gray-800 group-hover:text-yellow-600 transition-colors">
                      {word.word}
                    </h3>
                    {word.status && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(word.status)}`}>
                        {getStatusLabel(word.status)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-mono">
                    <span>/{word.phonetic || word.phonetic_us}/</span>
                    <button
                      onClick={(e) => playAudio(e, word.word)}
                      className="p-1 hover:bg-yellow-50 rounded-full text-yellow-500 transition-colors"
                    >
                      <Volume2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 font-medium line-clamp-1">
                    {word.meaning || word.definition}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Mock "Mastered" Check */}
                  {word.status === 'mastered' && (
                    <CheckCircle size={18} className="text-green-500" />
                  )}
                  <button className="p-2 text-gray-300 hover:text-gray-500 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p>暂无单词</p>
            <button className="mt-4 px-6 py-2 bg-yellow-400 text-white font-bold rounded-full text-sm shadow-lg shadow-yellow-200">
              导入词表
            </button>
          </div>
        )}
      </div>

      <WordDetailModal
        visible={!!selectedWord}
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30">
        <Plus size={28} />
      </button>
    </div>
  );
}
