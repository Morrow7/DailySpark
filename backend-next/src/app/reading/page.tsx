'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/request';
import { mockArticles } from '@/lib/mockArticles';
import { mockWords } from '@/lib/mockWords';
import WordDetailModal, { Word } from '@/components/WordDetailModal';
import { BookOpen, Clock, ChevronLeft, Bookmark } from 'lucide-react';

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
    return <div className="p-8 text-center text-gray-500">Loading articles...</div>;
  }

  // Reader View
  if (selectedArticle) {
    const paragraphs = selectedArticle.content.split('\n');
    
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 mb-24">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 py-4 border-b border-gray-100 flex items-center justify-between mb-6">
          <button 
            onClick={() => setSelectedArticle(null)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={24} />
            <span className="ml-1 font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">{selectedArticle.title}</h1>
          <button className="text-gray-400 hover:text-gray-900">
            <Bookmark size={24} />
          </button>
        </div>

        {/* Content */}
        <article className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{selectedArticle.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 font-medium">
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">{selectedArticle.category || 'General'}</span>
            <span className="text-pink-500">{selectedArticle.level || 'General'}</span>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              {selectedArticle.readTime || '5 min'}
            </div>
          </div>

          <div className="space-y-6 text-gray-800 leading-8">
            {paragraphs.map((para: string, i: number) => (
              <p key={i} className="text-lg">
                {para.split(' ').map((word, j) => (
                  <span
                    key={`${i}-${j}`}
                    onClick={() => handleWordClick(word)}
                    className="cursor-pointer hover:bg-yellow-100 hover:text-blue-600 transition-colors rounded px-0.5"
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
    <div className="max-w-3xl mx-auto px-4 py-6 mb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reading</h1>

      {/* Hero */}
      {articles.length > 0 && (
        <div className="bg-gradient-to-br from-pink-500 to-rose-400 rounded-2xl p-6 text-white mb-8 shadow-lg transform hover:scale-[1.01] transition-transform cursor-pointer"
             onClick={() => setSelectedArticle(articles[0])}>
          <div className="text-pink-100 text-sm font-semibold mb-2">Today's Pick</div>
          <h2 className="text-3xl font-extrabold mb-2">{articles[0].title}</h2>
          <div className="text-pink-100 text-sm mb-4">
            {articles[0].readTime || '5 min'} • {articles[0].level || 'General'}
          </div>
          <button className="bg-white text-pink-500 px-4 py-2 rounded-full font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors">
            Read Now
          </button>
        </div>
      )}

      {/* List */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">All Articles</h3>
      <div className="space-y-4">
        {articles.map(article => (
          <div 
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-500">
                {article.category || 'General'}
              </div>
              <div className="text-xs font-bold text-pink-500">{article.level || 'General'}</div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{article.title}</h3>
            <div className="flex items-center text-xs text-gray-400">
              <Clock size={12} className="mr-1" />
              {article.readTime || '5 min'}
            </div>
          </div>
        ))}
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
