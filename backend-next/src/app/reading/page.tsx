'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/request';
import { mockArticles } from '@/lib/mockArticles';
import { mockWords } from '@/lib/mockWords';
import WordDetailModal, { Word } from '@/components/WordDetailModal';
import { BookOpen, Clock, ChevronLeft, Bookmark, Tag, Star } from 'lucide-react';

export default function ReadingPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Word Modal State
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userWords, setUserWords] = useState<Word[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Try to fetch from API first
      try {
        const data = await apiFetch('/api/articles');
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        } else {
          setArticles(mockArticles);
        }
      } catch (e) {
        console.log('API fetch failed, using mock data');
        setArticles(mockArticles);
      }

      // Load user words (for finding existing words)
      try {
        const words = await apiFetch('/api/words');
        setUserWords(words);
      } catch (e) {
        console.log('Failed to load user words');
      }
    } finally {
      setLoading(false);
    }
  };

  const findWord = (text: string) => {
    const cleanText = text.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (!cleanText) return null;

    // 1. Check user words (API)
    const userFound = userWords.find((w: any) => w.word.toLowerCase() === cleanText);
    if (userFound) return userFound;

    // 2. Check mock dictionary
    const mockFound = mockWords.find(w => w.word.toLowerCase() === cleanText);
    if (mockFound) return mockFound;

    // 3. Return temp object
    return {
      id: Date.now().toString(),
      word: cleanText,
      phonetic_us: '/.../',
      phonetic_uk: '/.../',
      part_of_speech: 'unknown',
      meaning: '点击了单词: ' + cleanText + ' (未在本地词库中找到)',
      level: 'General',
      tags: [],
      examples: [],
      synonyms: [],
      antonyms: [],
      roots: ''
    } as Word;
  };

  const handleWordClick = (text: string) => {
    const wordData = findWord(text);
    if (wordData) {
      setSelectedWord(wordData);
      setModalVisible(true);
    }
  };

  const handleToggleFavorite = async (word: Word) => {
    if (selectedWord) {
      setSelectedWord({ ...selectedWord, isFavorite: !selectedWord.isFavorite });
    }
    alert('已添加到生词本 (Mock)');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mb-24 space-y-6">
        <div className="h-64 bg-white rounded-[32px] animate-pulse border-2 border-gray-100" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-40 bg-white rounded-[24px] animate-pulse border-2 border-gray-100" />
           ))}
        </div>
      </div>
    );
  }

  // Reader View
  if (selectedArticle) {
    const paragraphs = selectedArticle.content.split('\n');
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 mb-24 animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-[#fffcf5]/95 backdrop-blur-xl z-20 py-4 -mx-4 px-4 border-b border-gray-100 flex items-center justify-between mb-8 transition-all">
          <button 
            onClick={() => setSelectedArticle(null)}
            className="flex items-center text-gray-600 hover:text-cheese-500 transition-colors bg-white border-2 border-gray-100 hover:border-cheese-300 px-4 py-2 rounded-2xl font-bold text-sm shadow-sm"
          >
            <ChevronLeft size={20} strokeWidth={3} />
            <span className="ml-1">Back</span>
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all border-2 border-transparent hover:border-pink-200">
               <Bookmark size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Content */}
        <article className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-6 leading-tight tracking-tight">
            {selectedArticle.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-10 font-bold">
            <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-blue-100">
              <Tag size={14} strokeWidth={3} />
              {selectedArticle.category || 'General'}
            </span>
            <span className="bg-green-50 text-green-600 px-3 py-1.5 rounded-xl border border-green-100">
              {selectedArticle.level || 'General'}
            </span>
            <div className="flex items-center text-gray-400 ml-auto bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <Clock size={16} className="mr-1.5" strokeWidth={2.5} />
              {selectedArticle.readTime || '5 min'} read
            </div>
          </div>

          <div className="space-y-8 text-gray-700 leading-[2.2] font-serif text-xl">
            {paragraphs.map((para: string, i: number) => (
              <p key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                {para.split(' ').map((word, j) => (
                  <span
                    key={`${i}-${j}`}
                    onClick={() => handleWordClick(word)}
                    className="cursor-pointer hover:bg-cheese-100 hover:text-cheese-600 transition-colors rounded px-1 selection:bg-cheese-200"
                  >
                    {word}{' '}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </article>

        <WordDetailModal 
          visible={modalVisible}
          word={selectedWord}
          onClose={() => setModalVisible(false)}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    );
  }

  // List View
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 mb-24 md:mb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: List */}
        <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-extrabold text-cheese-title mb-8 flex items-center gap-3 tracking-tight">
                <span className="w-3 h-10 bg-cheese-400 rounded-full inline-block rotate-12 shadow-sm" />
                Reading Lounge
            </h1>

            {/* Hero */}
            {articles.length > 0 && (
                <div 
                className="group relative bg-[#ffedd5] rounded-[32px] p-8 text-gray-800 mb-10 shadow-[0_8px_0_#fed7aa] overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 border-2 border-[#fed7aa]"
                onClick={() => setSelectedArticle(articles[0])}
                >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-extrabold mb-4 shadow-sm text-orange-500 uppercase tracking-wider">
                      <Star size={12} fill="currentColor" /> Today's Pick
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight max-w-lg text-gray-900">
                    {articles[0].title}
                    </h2>
                    <div className="flex items-center gap-4 text-gray-600 text-sm mb-8 font-bold">
                    <span className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-xl">
                        <Clock size={16} strokeWidth={2.5} /> {articles[0].readTime || '5 min'}
                    </span>
                    <span className="bg-white/50 px-3 py-1.5 rounded-xl">
                        {articles[0].level || 'General'}
                    </span>
                    </div>
                    <button className="cheese-btn-primary px-8 py-3.5 rounded-2xl text-base shadow-lg flex items-center gap-2 group-hover:gap-3 group-hover:scale-105 transition-all">
                    Start Reading <BookOpen size={18} strokeWidth={3} />
                    </button>
                </div>
                </div>
            )}

            {/* List */}
            <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-xl font-extrabold text-gray-800">All Stories</h3>
                <button className="text-sm text-cheese-500 font-bold hover:bg-cheese-50 px-4 py-2 rounded-xl transition-colors">
                View All
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                {articles.map(article => (
                <div 
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="cheese-card p-6 cursor-pointer flex flex-col justify-between group h-full min-h-[200px]"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-blue-100">
                            {article.category || 'General'}
                        </span>
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border ${
                            article.level === 'Advanced' ? 'bg-red-50 text-red-500 border-red-100' :
                            article.level === 'Intermediate' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                            'bg-green-50 text-green-600 border-green-100'
                        }`}>
                            {article.level || 'General'}
                        </span>
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-gray-800 mb-3 group-hover:text-cheese-500 transition-colors line-clamp-2 leading-tight">
                        {article.title}
                        </h3>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-400 font-bold mt-4 pt-4 border-t border-gray-50">
                    <Clock size={14} className="mr-1.5" strokeWidth={2.5} />
                    {article.readTime || '5 min'} read
                    </div>
                </div>
                ))}
            </div>
        </div>

        {/* Right Column: Stats (Desktop Only) */}
        <div className="hidden lg:block w-80 space-y-6">
            <div className="cheese-card p-6 sticky top-8 border-cheese-100 bg-white">
                <h3 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg text-green-600"><BookOpen size={16} strokeWidth={3} /></div>
                    Reading Stats
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-xl font-black">
                            12
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Articles</div>
                            <div className="text-sm font-bold text-gray-700">Completed</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-black">
                            45
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Minutes</div>
                            <div className="text-sm font-bold text-gray-700">Reading Time</div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">Weekly Goal</h4>
                    <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                        <div className="bg-cheese-400 h-full rounded-full w-[60%] shadow-[0_2px_10px_rgba(251,191,36,0.5)]" />
                    </div>
                    <div className="text-xs font-bold text-gray-500 flex justify-between">
                        <span>3/5 Stories</span>
                        <span className="text-cheese-500">60%</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <WordDetailModal 
        visible={modalVisible}
        word={selectedWord}
        onClose={() => setModalVisible(false)}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
