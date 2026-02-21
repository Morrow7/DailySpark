'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/request';
import { mockArticles } from '@/lib/mockArticles';
import { mockWords } from '@/lib/mockWords';
import WordDetailModal, { Word } from '@/components/WordDetailModal';
import { BookOpen, Clock, ChevronLeft, Bookmark, Tag } from 'lucide-react';

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
    // Implement API call to save word
    // For now just toggle local state
    if (selectedWord) {
      setSelectedWord({ ...selectedWord, isFavorite: !selectedWord.isFavorite });
    }
    alert('已添加到生词本 (Mock)');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 mb-24 space-y-6">
        <div className="h-64 bg-white rounded-3xl animate-pulse shadow-sm" />
        <div className="space-y-4">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-32 bg-white rounded-2xl animate-pulse shadow-sm" />
           ))}
        </div>
      </div>
    );
  }

  // Reader View
  if (selectedArticle) {
    const paragraphs = selectedArticle.content.split('\n');
    
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 mb-24 animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-lg z-20 py-4 -mx-4 px-4 border-b border-gray-100 flex items-center justify-between mb-6 shadow-sm transition-all">
          <button 
            onClick={() => setSelectedArticle(null)}
            className="flex items-center text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl"
          >
            <ChevronLeft size={20} />
            <span className="ml-1 font-medium text-sm">Back</span>
          </button>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-all">
               <Bookmark size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <article className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">{selectedArticle.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-8 font-medium">
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg flex items-center gap-1">
              <Tag size={14} />
              {selectedArticle.category || 'General'}
            </span>
            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg border border-green-100">
              {selectedArticle.level || 'General'}
            </span>
            <div className="flex items-center text-gray-400 ml-auto">
              <Clock size={16} className="mr-1.5" />
              {selectedArticle.readTime || '5 min'} read
            </div>
          </div>

          <div className="space-y-8 text-gray-700 leading-8 font-serif">
            {paragraphs.map((para: string, i: number) => (
              <p key={i} className="text-xl">
                {para.split(' ').map((word, j) => (
                  <span
                    key={`${i}-${j}`}
                    onClick={() => handleWordClick(word)}
                    className="cursor-pointer hover:bg-yellow-200 hover:text-blue-800 transition-colors rounded px-0.5 selection:bg-pink-200"
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
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-green-500 rounded-full inline-block" />
                Reading Lounge
            </h1>

            {/* Hero */}
            {articles.length > 0 && (
                <div 
                className="group relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-8 text-white mb-10 shadow-lg shadow-green-200 overflow-hidden cursor-pointer transition-transform hover:-translate-y-1"
                onClick={() => setSelectedArticle(articles[0])}
                >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-4 border border-white/10">
                    Today's Pick
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight max-w-lg">
                    {articles[0].title}
                    </h2>
                    <div className="flex items-center gap-4 text-green-50 text-sm mb-6 font-medium">
                    <span className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded-lg">
                        <Clock size={14} /> {articles[0].readTime || '5 min'}
                    </span>
                    <span className="bg-white/20 px-2 py-1 rounded-lg">
                        {articles[0].level || 'General'}
                    </span>
                    </div>
                    <button className="bg-white text-green-600 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 group-hover:gap-3">
                    Read Now <BookOpen size={16} />
                    </button>
                </div>
                </div>
            )}

            {/* List */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">All Articles</h3>
                <button className="text-sm text-blue-500 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors">
                View All
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {articles.map(article => (
                <div 
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="group bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-xl hover:shadow-gray-200/50 transition-all cursor-pointer hover:border-green-100 relative overflow-hidden flex flex-col justify-between"
                >
                    <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />
                    
                    <div>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide">
                            {article.category || 'General'}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            article.level === 'Advanced' ? 'bg-red-50 text-red-500' :
                            article.level === 'Intermediate' ? 'bg-yellow-50 text-yellow-600' :
                            'bg-green-50 text-green-600'
                        }`}>
                            {article.level || 'General'}
                        </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2 leading-tight">
                        {article.title}
                        </h3>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-400 font-medium mt-4">
                    <Clock size={14} className="mr-1.5" />
                    {article.readTime || '5 min'} read
                    </div>
                </div>
                ))}
            </div>
        </div>

        {/* Right Column: Stats / Mini Profile (Desktop Only) */}
        <div className="hidden lg:block w-80 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
                <h3 className="font-bold text-gray-900 mb-4">Reading Stats</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">12</div>
                            <div className="text-xs text-gray-500">Articles Read</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">45m</div>
                            <div className="text-xs text-gray-500">Time Spent</div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-sm text-gray-800 mb-3">Your Goals</h4>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div className="bg-green-500 h-2 rounded-full w-[60%]" />
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                        <span>3/5 Articles</span>
                        <span>60%</span>
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
